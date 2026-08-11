/**
 * @module test.unit.di-back
 * @description Helper to create a clean compatibility container for unit tests.
 */

import path from 'node:path';
import { builtinModules } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CDC_RE = /(\${1,3})(?:_[a-z][0-9A-Za-z]*)*$/;

const normalizeCdc = (cdc) => {
  if (typeof cdc !== 'string' || cdc.length === 0) {
    throw new Error('CDC must be a non-empty string.');
  }
  return cdc;
};

const parseCdc = (cdc) => {
  const origin = normalizeCdc(cdc);
  let platform = 'teq';
  let source = origin;
  if (source.startsWith('node:')) {
    platform = 'node';
    source = source.slice(5);
  } else if (source.startsWith('npm:')) {
    platform = 'npm';
    source = source.slice(4);
  }

  const marker = source.match(CDC_RE);
  let core = source;
  let hasFactory = false;
  if (marker) {
    core = source.slice(0, marker.index);
    hasFactory = true;
  }

  const exportDelim = core.indexOf('__');
  let moduleName = core;
  let exportName = null;
  if (exportDelim !== -1) {
    moduleName = core.slice(0, exportDelim);
    exportName = core.slice(exportDelim + 2);
  } else if (hasFactory) {
    exportName = 'default';
  }

  return { origin, platform, moduleName, exportName, isFactory: hasFactory };
};

const deriveSpecifier = ({ platform, moduleName }, namespaceRoots) => {
  if (platform === 'node') {
    if (builtinModules.includes(moduleName) || builtinModules.includes(`node:${moduleName}`)) {
      return `node:${moduleName}`;
    }
    return moduleName;
  }
  if (platform === 'npm') return moduleName;

  const rule = [...namespaceRoots]
    .filter((entry) => moduleName.startsWith(entry.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!rule) {
    throw new Error(`No namespace root is configured for '${moduleName}'.`);
  }

  const remainder = moduleName.slice(rule.prefix.length);
  const relativePath = remainder.split('_').join('/');
  const filePath = relativePath.endsWith(rule.defaultExt)
    ? relativePath
    : `${relativePath}${rule.defaultExt}`;

  return pathToFileURL(path.join(rule.target, filePath)).href;
};

const parseDestructuredDeps = (source) => {
  if (typeof source !== 'string' || source.length === 0) return [];

  const patterns = [
    /constructor\s*\(\s*\{([\s\S]*?)\}\s*\)/,
    /function[^(]*\(\s*\{([\s\S]*?)\}\s*\)/,
    /^\s*\(\s*\{([\s\S]*?)\}\s*\)\s*=>/,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match) continue;
    const keys = [];
    const body = match[1];
    const keyRe = /(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_$]+))\s*:/g;
    let keyMatch;
    while ((keyMatch = keyRe.exec(body)) !== null) {
      keys.push(keyMatch[1] || keyMatch[2] || keyMatch[3]);
    }
    return keys;
  }

  return [];
};

const selectExport = (namespace, exportName) => {
  if (exportName === null) {
    const defaultValue = namespace.default;
    if (defaultValue && typeof defaultValue === 'object' && 'TRACE' in defaultValue && 'FATAL' in defaultValue) {
      return namespace;
    }
    return defaultValue ?? namespace;
  }
  if (!(exportName in namespace)) {
    throw new Error(`Export '${exportName}' is not found in module namespace.`);
  }
  return namespace[exportName];
};

const resolveDeclaredDeps = (namespace, exportName) => {
  const declared = namespace?.__deps__;
  if (!declared || typeof declared !== 'object' || Array.isArray(declared)) {
    return [];
  }

  const scopedKey = exportName ?? 'default';
  const scoped = declared[scopedKey];
  if (scoped && typeof scoped === 'object' && !Array.isArray(scoped)) {
    return Object.entries(scoped).map(([key, value]) => [key, String(value)]);
  }

  if (exportName === 'default' || exportName === null) {
    const entries = Object.entries(declared);
    if (entries.every(([, value]) => typeof value === 'string')) {
      return entries.map(([key, value]) => [key, String(value)]);
    }
  }

  return [];
};

const isConstructible = (value) => {
  if (typeof value !== 'function') return false;
  try {
    Reflect.construct(String, [], value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Create and configure a clean compatibility container for unit tests.
 * @returns {Promise<{enableTestMode: () => void, addNamespaceRoot: (prefix: string, target: string, defaultExt: string) => void, register: (cdc: string, mock: any) => void, get: (cdc: string) => Promise<any>}>}
 */
export async function createTestContainer() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '../..');

  const namespaceRoots = [
    { prefix: 'Mindstream_Back_', target: path.join(projectRoot, 'src'), defaultExt: '.mjs' },
    { prefix: 'Mindstream_Shared_', target: path.join(projectRoot, 'web', 'app', 'Shared'), defaultExt: '.mjs' },
    { prefix: 'Mindstream_Web_', target: path.join(projectRoot, 'web', 'app', 'Web'), defaultExt: '.mjs' },
    { prefix: 'TeqFw_Web_', target: path.join(projectRoot, 'node_modules', '@teqfw', 'web', 'src'), defaultExt: '.mjs' },
    { prefix: 'Teqfw_Di_', target: path.join(projectRoot, 'node_modules', '@teqfw', 'di', 'src'), defaultExt: '.mjs' },
    { prefix: 'TeqFw_Cfg_', target: path.join(projectRoot, 'node_modules', '@teqfw', 'cfg', 'src'), defaultExt: '.mjs' },
    { prefix: 'TeqFw_Db_', target: path.join(projectRoot, 'node_modules', '@teqfw', 'db', 'src'), defaultExt: '.mjs' },
    { prefix: 'TeqFw_Log_', target: path.join(projectRoot, 'node_modules', '@teqfw', 'log', 'src'), defaultExt: '.mjs' },
  ];
  const mocks = new Map();
  mocks.set('TeqFw_Log_Provider$', {
    forSource() {
      return {
        debug() {},
        info() {},
        warn() {},
        error() {},
      };
    },
  });
  const cache = new Map();

  const container = {
    enableTestMode() {},
    addNamespaceRoot(prefix, target, defaultExt) {
      namespaceRoots.push({ prefix, target, defaultExt });
    },
    register(cdc, mock) {
      mocks.set(normalizeCdc(cdc), mock);
    },
    async get(cdc) {
      const key = normalizeCdc(cdc);
      if (mocks.has(key)) return mocks.get(key);
      if (cache.has(key)) return cache.get(key);

      const depId = parseCdc(key);
      const specifier = deriveSpecifier(depId, namespaceRoots);
      const namespace = await import(specifier);
      const selected = selectExport(namespace, depId.exportName);

      if (!depId.isFactory) {
        cache.set(key, selected);
        return selected;
      }

      const declaredDeps = resolveDeclaredDeps(namespace, depId.exportName);
      const deps = {};
      if (declaredDeps.length > 0) {
        for (const [paramKey, depKey] of declaredDeps) {
          deps[paramKey] = await container.get(depKey);
        }
      } else {
        const depKeys = parseDestructuredDeps(selected.toString());
        for (const depKey of depKeys) {
          deps[depKey] = await container.get(depKey);
        }
      }

      const instance = isConstructible(selected) ? new selected(deps) : selected(deps);
      cache.set(key, instance);
      return instance;
    },
  };

  return container;
}

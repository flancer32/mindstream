/**
 * @module Mindstream_Back_App_Configuration
 * @description Backend application configuration singleton.
 */
export default class Mindstream_Back_App_Configuration {
  constructor({ 'node:fs/promises': fs, 'node:path': path, 'node:process': processModule }) {
    const processRef = processModule?.default ?? processModule;

    const DEFAULTS = Object.freeze({
      API_PORT: 3000,
      OPENAI_API_KEY: '',
      OPENAI_BASE_URL: 'https://api.openai.com/v1',
      OPENAI_MODEL: '',
    });

    let _initialized = false;
    let _values = { ...DEFAULTS };

    const ensureInitialized = function () {
      if (!_initialized) {
        throw new Error('Mindstream_Back_App_Configuration is not initialized.');
      }
    };

    const parseEnvFile = function (content) {
      const result = {};
      if (!content) return result;
      const lines = content.split(/\r?\n/);
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIndex = line.indexOf('=');
        const key = (eqIndex === -1 ? line : line.slice(0, eqIndex)).trim();
        let value = (eqIndex === -1 ? '' : line.slice(eqIndex + 1)).trim();
        if (!key) continue;
        const quote = value[0];
        if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
          value = value.slice(1, -1);
        }
        result[key] = value;
      }
      return result;
    };

    const coerceString = function (value, fallback) {
      if (value === undefined || value === null || value === '') return fallback;
      return String(value);
    };

    const coercePort = function (value, fallback) {
      if (value === undefined || value === null || value === '') return fallback;
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const loadEnvFile = async function (projectRoot) {
      const envPath = path.join(projectRoot, '.env');
      try {
        const content = await fs.readFile(envPath, 'utf8');
        return parseEnvFile(content);
      } catch (err) {
        if (err?.code === 'ENOENT') return {};
        throw err;
      }
    };

    this.init = async function (projectRoot) {
      if (_initialized) return;
      if (!projectRoot) throw new Error('projectRoot is required to initialize configuration.');

      const fileEnv = await loadEnvFile(projectRoot);
      for (const [key, value] of Object.entries(fileEnv)) {
        if (processRef.env[key] === undefined) {
          processRef.env[key] = value;
        }
      }

      _values = {
        API_PORT: coercePort(processRef.env.API_PORT, DEFAULTS.API_PORT),
        OPENAI_API_KEY: coerceString(processRef.env.OPENAI_API_KEY, DEFAULTS.OPENAI_API_KEY),
        OPENAI_BASE_URL: coerceString(processRef.env.OPENAI_BASE_URL, DEFAULTS.OPENAI_BASE_URL),
        OPENAI_MODEL: coerceString(processRef.env.OPENAI_MODEL, DEFAULTS.OPENAI_MODEL),
      };

      _initialized = true;
    };

    this.getApiPort = function () {
      ensureInitialized();
      return _values.API_PORT;
    };

    this.getOpenaiApiKey = function () {
      ensureInitialized();
      return _values.OPENAI_API_KEY;
    };

    this.getOpenaiBaseUrl = function () {
      ensureInitialized();
      return _values.OPENAI_BASE_URL;
    };

    this.getOpenaiModel = function () {
      ensureInitialized();
      return _values.OPENAI_MODEL;
    };
  }
}

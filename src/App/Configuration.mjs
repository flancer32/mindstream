/**
 * @LLM-DOC: Normative configuration structure is defined in `ctx/docs/code/configuration/structure.md`.
 * @LLM-DOC: The structure described there is authoritative for this module.
 * @LLM-DOC: `process.env` is the canonical source of configuration values.
 * @LLM-DOC: The `.env` file is used only to prepare `process.env` before reading configuration.
 * 
 * @module Mindstream_Back_App_Configuration
 * @description Backend application configuration singleton.
 */
export default class Mindstream_Back_App_Configuration {
  constructor({ 'node:process': processModule, 'node:fs': fsModule, 'node:path': pathModule, Mindstream_Shared_Logger$: logger }) {
    const processRef = processModule?.default ?? processModule;
    const fsRef = fsModule?.default ?? fsModule;
    const pathRef = pathModule?.default ?? pathModule;
    const NAMESPACE = 'Mindstream_Back_App_Configuration';

    let _initialized = false;
    let _config = null;

    const ensureInitialized = function () {
      if (!_initialized) {
        throw new Error('Mindstream_Back_App_Configuration is not initialized.');
      }
    };

    const coerceString = function (value) {
      if (value === undefined || value === null) return undefined;
      return String(value);
    };

    const coercePort = function (value) {
      if (value === undefined || value === null || value === '') return undefined;
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const freezeConfig = function (config) {
      Object.freeze(config.server);
      Object.freeze(config.db);
      Object.freeze(config.llm);
      return Object.freeze(config);
    };

    const isIgnorableLine = function (line) {
      if (!line) return true;
      const trimmed = line.trim();
      return trimmed.length === 0 || trimmed.startsWith('#');
    };

    const applyEnvLine = function (line, targetEnv) {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex < 0) {
        throw new Error(`Invalid .env line "${line}".`);
      }
      const rawKey = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      if (!rawKey) {
        throw new Error(`Invalid .env key in line "${line}".`);
      }
      if (Object.prototype.hasOwnProperty.call(targetEnv, rawKey)) return;
      targetEnv[rawKey] = rawValue;
    };

    const loadEnvFile = function (projectRoot) {
      if (!projectRoot || typeof projectRoot !== 'string') return;
      if (!fsRef || !pathRef) return;
      const envPath = pathRef.join(projectRoot, '.env');
      try {
        if (!fsRef.existsSync(envPath)) return;
        const content = fsRef.readFileSync(envPath, 'utf-8');
        const lines = String(content).split(/\r?\n/u);
        const env = processRef?.env ?? {};
        for (const line of lines) {
          if (isIgnorableLine(line)) continue;
          applyEnvLine(line, env);
        }
      } catch (err) {
        if (err instanceof Error && (err?.message ?? '').includes('Invalid .env')) {
          throw err;
        }
        if (logger?.exception) {
          logger.exception(NAMESPACE, err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    this.init = async function (projectRoot) {
      if (_initialized) return;
      loadEnvFile(projectRoot);

      const env = processRef?.env ?? {};
      _config = freezeConfig({
        server: {
          port: coercePort(env.SERVER_PORT),
        },
        db: {
          client: coerceString(env.DB_CLIENT),
          host: coerceString(env.DB_HOST),
          port: coercePort(env.DB_PORT),
          database: coerceString(env.DB_DATABASE),
          user: coerceString(env.DB_USER),
          password: coerceString(env.DB_PASSWORD),
        },
        llm: {
          apiKey: coerceString(env.LLM_API_KEY),
          baseUrl: coerceString(env.LLM_BASE_URL),
          generationModel: coerceString(env.LLM_GENERATION_MODEL),
          embeddingModel: coerceString(env.LLM_EMBEDDING_MODEL),
        },
      });

      _initialized = true;
    };

    this.get = function () {
      ensureInitialized();
      return _config;
    };
  }
}

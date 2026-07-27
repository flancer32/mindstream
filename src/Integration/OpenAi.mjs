// @ts-check
/**
 * @namespace Mindstream_Back_Integration_OpenAi
 * @description Thin OpenAI API client for backend code.
 */
export default class Mindstream_Back_Integration_OpenAi {
/**
 * @param {object} deps
 * @param {Mindstream_Back_App_Configuration$} deps.config
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Mindstream_Back_Platform_Fetch$} deps.fetcher
 */
constructor({
    config,
    logger,
    fetcher,
  }) {
    const NAMESPACE = 'Mindstream_Back_Integration_OpenAi';

    /**
 * @param {unknown} err
 * @returns {unknown}
 */
/**
 * @param {unknown} err
 * @returns {unknown}
 */
const normalizeError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    /**
 * @param {unknown} baseUrl
 * @returns {unknown}
 */
/**
 * @param {unknown} baseUrl
 * @returns {unknown}
 */
const normalizeBaseUrl = function (baseUrl) {
      if (!baseUrl || typeof baseUrl !== 'string') return null;
      return baseUrl.replace(/\/+$/u, '');
    };

    /**
 * @param {unknown} input
 * @returns {unknown}
 */
/**
 * @param {unknown} input
 * @returns {unknown}
 */
const normalizeInput = function (input) {
      if (typeof input === 'string') return input;
      if (Array.isArray(input) && input.every((item) => typeof item === 'string')) {
        return input;
      }
      throw new Error('Input must be a string or an array of strings.');
    };

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const getConfig = function () {
      const cfg = config?.get?.();
      const llm = cfg?.llm ?? {};
      const apiKey = llm.apiKey;
      const generationModel = llm.generationModel;
      const embeddingModel = llm.embeddingModel;
      const baseUrl = normalizeBaseUrl(llm.baseUrl);
      if (!apiKey || !baseUrl || !generationModel || !embeddingModel) {
        throw new Error('LLM configuration is incomplete.');
      }
      return { apiKey, baseUrl, generationModel, embeddingModel };
    };

    /**
 * @param {unknown} text
 * @returns {unknown}
 */
/**
 * @param {unknown} text
 * @returns {unknown}
 */
const parseJson = function (text) {
      if (!text) return null;
      return JSON.parse(text);
    };

    /**
 * @param {unknown} path
 * @param {unknown} payload
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} path
 * @param {unknown} payload
 * @returns {Promise<unknown>}
 */
const postJson = async function (path, payload) {
      const { apiKey, baseUrl } = getConfig();
      const url = `${baseUrl}${path}`;
      try {
        const response = await fetcher.fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response || typeof response.text !== 'function') {
          throw new Error('OpenAI response is invalid.');
        }

        const rawText = await response.text();
        let data = null;
        try {
          data = parseJson(rawText);
        } catch (err) {
          const parseError = new Error('Failed to parse OpenAI response JSON.');
          parseError.cause = err;
          throw parseError;
        }

        if (!response.ok) {
          const status = response.status ?? 0;
          const error = new Error(`OpenAI request failed with status ${status}.`);
          if (data !== null) {
            error.cause = data;
          }
          throw error;
        }

        return data;
      } catch (err) {
        const normalized = normalizeError(err);
        if (logger?.exception) {
          logger.exception(NAMESPACE, normalized);
        }
        throw normalized;
      }
    };

    /**
 * @param {unknown} input
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} input
 * @returns {Promise<unknown>}
 */
this.summarize = async function (input) {
      const { generationModel } = getConfig();
      const normalized = normalizeInput(input);
      return await postJson('/responses', {
        model: generationModel,
        input: normalized,
      });
    };

    /**
 * @param {unknown} input
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} input
 * @returns {Promise<unknown>}
 */
this.embed = async function (input) {
      const { embeddingModel } = getConfig();
      const normalized = normalizeInput(input);
      return await postJson('/embeddings', {
        model: embeddingModel,
        input: normalized,
      });
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    config: 'Mindstream_Back_App_Configuration$',
    logger: 'Mindstream_Back_Logger$',
    fetcher: 'Mindstream_Back_Platform_Fetch$',
  }),
});

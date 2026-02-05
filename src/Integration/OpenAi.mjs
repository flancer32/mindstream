/**
 * @module Mindstream_Back_Integration_OpenAi
 * @description Thin OpenAI API client for backend code.
 */
export default class Mindstream_Back_Integration_OpenAi {
  constructor({
    Mindstream_Back_App_Configuration$: config,
    Mindstream_Shared_Logger$: logger,
    Mindstream_Back_Platform_Fetch$: fetcher,
  }) {
    const NAMESPACE = 'Mindstream_Back_Integration_OpenAi';

    const normalizeError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    const normalizeBaseUrl = function (baseUrl) {
      if (!baseUrl || typeof baseUrl !== 'string') return null;
      return baseUrl.replace(/\/+$/u, '');
    };

    const normalizeInput = function (input) {
      if (typeof input === 'string') return input;
      if (Array.isArray(input) && input.every((item) => typeof item === 'string')) {
        return input;
      }
      throw new Error('Input must be a string or an array of strings.');
    };

    const getConfig = function () {
      const cfg = config?.get?.();
      const llm = cfg?.llm ?? {};
      const apiKey = llm.apiKey;
      const model = llm.model;
      const baseUrl = normalizeBaseUrl(llm.baseUrl);
      if (!apiKey || !baseUrl || !model) {
        throw new Error('LLM configuration is incomplete.');
      }
      return { apiKey, baseUrl, model };
    };

    const parseJson = function (text) {
      if (!text) return null;
      return JSON.parse(text);
    };

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

    this.summarize = async function (input) {
      const { model } = getConfig();
      const normalized = normalizeInput(input);
      return await postJson('/responses', {
        model,
        input: normalized,
      });
    };

    this.embed = async function (input) {
      const { model } = getConfig();
      const normalized = normalizeInput(input);
      return await postJson('/embeddings', {
        model,
        input: normalized,
      });
    };
  }
}

// @ts-check
/**
 * @namespace Mindstream_Back_Process_Generate_Summaries
 * @description Generates overview and annotation for publications without summaries.
 */
export default class Mindstream_Back_Process_Generate_Summaries {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Mindstream_Back_Integration_OpenAi$} deps.llmClient
 * @param {Mindstream_Back_Process_Publication_Store$} deps.publicationStore
 * @param {Mindstream_Back_Process_Publication_SummaryStore$} deps.summaryStore
 * @param {Mindstream_Back_Process_Publication_Status$} deps.statusCatalog
 */
constructor({
    logger,
    llmClient,
    publicationStore,
    summaryStore,
    statusCatalog,
  }) {
    const NAMESPACE = 'Mindstream_Back_Process_Generate_Summaries';

    /**
 * @param {unknown} err
 * @returns {unknown}
 */
/**
 * @param {unknown} err
 * @returns {unknown}
 */
const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    /**
 * @param {unknown} markdown
 * @returns {unknown}
 */
/**
 * @param {unknown} markdown
 * @returns {unknown}
 */
const buildPrompt = function (markdown) {
      return [
        'You generate semantic projections for a publication.',
        'Use only the provided markdown text.',
        'Return JSON only, without extra commentary.',
        'JSON schema: {"overview":"...","annotation":"..."}.',
        'Overview must be more detailed than annotation.',
        'Annotation must be concise.',
        'Use the same language as the input text.',
        '',
        'Markdown:',
        markdown,
      ].join('\n');
    };

    /**
 * @param {unknown} response
 * @returns {unknown}
 */
/**
 * @param {unknown} response
 * @returns {unknown}
 */
const extractText = function (response) {
      if (!response) return null;
      if (typeof response.output_text === 'string') return response.output_text;
      if (Array.isArray(response.output)) {
        for (const item of response.output) {
          const content = item?.content;
          if (!Array.isArray(content)) continue;
          for (const part of content) {
            if (typeof part?.text === 'string') return part.text;
          }
        }
      }
      if (Array.isArray(response.choices)) {
        const choice = response.choices[0];
        if (typeof choice?.message?.content === 'string') return choice.message.content;
        if (typeof choice?.text === 'string') return choice.text;
      }
      return null;
    };

    /**
 * @param {unknown} text
 * @returns {unknown}
 */
/**
 * @param {unknown} text
 * @returns {unknown}
 */
const parsePayload = function (text) {
      if (!text || typeof text !== 'string') {
        throw new Error('LLM response text is empty.');
      }
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (err) {
        const parseError = new Error('Failed to parse LLM response JSON.');
        parseError.cause = err;
        throw parseError;
      }
      if (!data || typeof data !== 'object') {
        throw new Error('LLM response JSON is invalid.');
      }
      if (typeof data.overview !== 'string' || !data.overview.trim()) {
        throw new Error('LLM response missing overview.');
      }
      if (typeof data.annotation !== 'string' || !data.annotation.trim()) {
        throw new Error('LLM response missing annotation.');
      }
      return {
        overview: data.overview.trim(),
        annotation: data.annotation.trim(),
      };
    };

    /**
 * @param {unknown} publication
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} publication
 * @returns {Promise<unknown>}
 */
const processPublication = async function (publication) {
      const publicationId = publication?.id;
      if (!Number.isFinite(Number(publicationId))) {
        throw new Error('Publication id is missing.');
      }

      const markdown = publication?.md_text;
      if (typeof markdown !== 'string' || !markdown.trim()) {
        throw new Error(`Publication ${publicationId} markdown is missing.`);
      }

      const existing = await summaryStore.findByPublicationId(publicationId);
      if (existing?.overview && existing?.annotation) {
        logger.info(NAMESPACE, `Publication ${publicationId} already has summaries.`);
        return;
      }

      const prompt = buildPrompt(markdown);
      const response = await llmClient.summarize(prompt);
      const text = extractText(response);
      const payload = parsePayload(text);
      await summaryStore.saveSummary({
        publicationId,
        overview: payload.overview,
        annotation: payload.annotation,
      });
      if (statusCatalog?.SUMMARY_READY) {
        await publicationStore.updateStatus({ id: publicationId, status: statusCatalog.SUMMARY_READY });
      }
      logger.info(NAMESPACE, `Summaries generated for publication ${publicationId}.`);
    };

    /**
 * @param {unknown} publicationId
 * @param {unknown} err
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} publicationId
 * @param {unknown} err
 * @returns {Promise<unknown>}
 */
const handleError = async function (publicationId, err) {
      const error = ensureError(err);
      logger.exception(NAMESPACE, error);
      if (Number.isFinite(Number(publicationId)) && statusCatalog?.SUMMARY_FAILED) {
        await publicationStore.updateStatus({ id: publicationId, status: statusCatalog.SUMMARY_FAILED });
      }
    };

    /**
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
this.execute = async function () {
      const limit = 3;
      const batch = await publicationStore.listForSummaries({ limit });
      if (!Array.isArray(batch) || !batch.length) return;

      for (const publication of batch) {
        const publicationId = publication?.id;
        try {
          await processPublication(publication);
        } catch (err) {
          await handleError(publicationId, err);
        }
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    logger: 'Mindstream_Back_Logger$',
    llmClient: 'Mindstream_Back_Integration_OpenAi$',
    publicationStore: 'Mindstream_Back_Process_Publication_Store$',
    summaryStore: 'Mindstream_Back_Process_Publication_SummaryStore$',
    statusCatalog: 'Mindstream_Back_Process_Publication_Status$',
  }),
});

// @ts-check
/**
 * @namespace Mindstream_Back_Ingest_Extract_Habr
 * @description Orchestrates extraction of markdown for Habr publications.
 */
export default class Mindstream_Back_Ingest_Extract_Habr {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Ingest_Source_Habr$} deps.habrSource
 * @param {Mindstream_Back_Ingest_Publication_Store$} deps.publicationStore
 * @param {Mindstream_Back_Ingest_Publication_ExtractionStore$} deps.extractionStore
 * @param {Mindstream_Back_Ingest_Publication_Status$} deps.statusCatalog
 * @param {Mindstream_Back_Ingest_Extract_Habr_Fetcher$} deps.fetcher
 * @param {Mindstream_Back_Ingest_Extract_Habr_Parser$} deps.parser
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {typeof import("node:timers/promises")} deps.timersModule
 */
constructor({
    habrSource,
    publicationStore,
    extractionStore,
    statusCatalog,
    fetcher,
    parser,
    logger,
    timersModule,
  }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Extract_Habr';
    const BATCH_SIZE = 4;
    const BATCH_PAUSE_MS = 3000;

    const setTimeoutRef = timersModule?.setTimeout;

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
 * @param {unknown} ms
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} ms
 * @returns {Promise<unknown>}
 */
const sleep = async function (ms) {
      if (typeof setTimeoutRef !== 'function') {
        throw new Error('Timer dependency is unavailable.');
      }
      await setTimeoutRef(ms);
    };

    /**
 * @param {unknown} publicationId
 * @param {unknown} status
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} publicationId
 * @param {unknown} status
 * @returns {Promise<unknown>}
 */
const updateStatus = async function (publicationId, status) {
      await publicationStore.updateStatus({ id: publicationId, status });
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
      const sourceUrl = publication?.source_url;
      logger.info(NAMESPACE, `Start extraction for publication ${publicationId}.`);

      try {
        if (!publicationId) {
          throw new Error('Publication id is missing.');
        }
        if (!sourceUrl) {
          const err = new Error('Publication URL is missing.');
          err.isExtractionError = true;
          throw err;
        }

        const existing = await extractionStore.findByPublicationId(publicationId);
        if (existing?.md_text) {
          await updateStatus(publicationId, statusCatalog.EXTRACTED);
          logger.info(NAMESPACE, `Publication ${publicationId} already extracted.`);
          return;
        }

        let html = existing?.html;
        if (!html) {
          html = await fetcher.fetchHtml(sourceUrl);
          await extractionStore.saveHtml({ publicationId, html });
        }

        const markdown = parser.extractMarkdown(html);
        await extractionStore.saveMarkdown({ publicationId, markdown });
        await updateStatus(publicationId, statusCatalog.EXTRACTED);
        logger.info(NAMESPACE, `Publication ${publicationId} extracted successfully.`);
      } catch (err) {
        const error = ensureError(err);
        const hasId = Number.isFinite(Number(publicationId));
        if (hasId) {
          if (error.isExtractionError) {
            await updateStatus(publicationId, statusCatalog.EXTRACT_BROKEN);
          } else {
            await updateStatus(publicationId, statusCatalog.EXTRACT_FAILED);
          }
        }
        logger.exception(NAMESPACE, error);
      }
    };

    /**
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
this.execute = async function () {
      const sourceId = habrSource.getSourceId();
      let batch = await publicationStore.listForExtraction({
        sourceId,
        status: statusCatalog.EXTRACT_PENDING,
        limit: BATCH_SIZE,
      });

      while (batch.length) {
        for (const publication of batch) {
          await processPublication(publication);
        }
        if (batch.length < BATCH_SIZE) {
          break;
        }
        await sleep(BATCH_PAUSE_MS);
        batch = await publicationStore.listForExtraction({
          sourceId,
          status: statusCatalog.EXTRACT_PENDING,
          limit: BATCH_SIZE,
        });
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    habrSource: 'Mindstream_Back_Ingest_Source_Habr$',
    publicationStore: 'Mindstream_Back_Ingest_Publication_Store$',
    extractionStore: 'Mindstream_Back_Ingest_Publication_ExtractionStore$',
    statusCatalog: 'Mindstream_Back_Ingest_Publication_Status$',
    fetcher: 'Mindstream_Back_Ingest_Extract_Habr_Fetcher$',
    parser: 'Mindstream_Back_Ingest_Extract_Habr_Parser$',
    logger: 'Mindstream_Back_Logger$',
    timersModule: 'node:timers/promises',
  }),
});

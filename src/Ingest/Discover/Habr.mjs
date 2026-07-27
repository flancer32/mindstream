// @ts-check
/**
 * @namespace Mindstream_Back_Ingest_Discover_Habr
 * @description Orchestrates Habr RSS discovery and storage.
 */
export default class Mindstream_Back_Ingest_Discover_Habr {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Ingest_Source_Habr$} deps.habrSource
 * @param {Mindstream_Back_Ingest_Publication_Store$} deps.publicationStore
 * @param {Mindstream_Back_Logger$} deps.logger
 */
constructor({
    habrSource,
    publicationStore,
    logger,
  }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Discover_Habr';

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
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
this.execute = async function () {
      try {
        const items = await habrSource.discover();
        await publicationStore.saveDiscovered({
          source: habrSource.getSourceDescriptor(),
          items,
        });
      } catch (err) {
        logger.exception(NAMESPACE, ensureError(err));
        throw err;
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    habrSource: 'Mindstream_Back_Ingest_Source_Habr$',
    publicationStore: 'Mindstream_Back_Ingest_Publication_Store$',
    logger: 'Mindstream_Back_Logger$',
  }),
});

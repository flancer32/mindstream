/**
 * @module Mindstream_Back_Ingest_Discover_Habr
 * @description Orchestrates Habr RSS discovery and storage.
 */
export default class Mindstream_Back_Ingest_Discover_Habr {
  constructor({
    Mindstream_Back_Ingest_Source_Habr$: habrSource,
    Mindstream_Back_Ingest_Publication_Store$: publicationStore,
    Mindstream_Shared_Logger$: logger,
  }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Discover_Habr';

    const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

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

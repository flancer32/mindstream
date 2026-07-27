// @ts-check
/**
 * @namespace Mindstream_Back_Process_Generate_Embeddings
 * @description Generates embeddings for publication summaries.
 */
export default class Mindstream_Back_Process_Generate_Embeddings {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Mindstream_Back_Integration_OpenAi$} deps.embeddingClient
 * @param {Mindstream_Back_Process_Publication_Store$} deps.publicationStore
 * @param {Mindstream_Back_Process_Publication_EmbeddingStore$} deps.embeddingStore
 * @param {Mindstream_Back_Process_Publication_Status$} deps.statusCatalog
 */
constructor({
    logger,
    embeddingClient,
    publicationStore,
    embeddingStore,
    statusCatalog,
  }) {
    const NAMESPACE = 'Mindstream_Back_Process_Generate_Embeddings';

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
 * @param {unknown} value
 * @param {unknown} name
 * @param {unknown} publicationId
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @param {unknown} name
 * @param {unknown} publicationId
 * @returns {unknown}
 */
const normalizeText = function (value, name, publicationId) {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`Publication ${publicationId} ${name} is missing.`);
      }
      return value.trim();
    };

    /**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
const normalizeVector = function (value, name) {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${name} embedding is missing.`);
      }
      const normalized = value.map((item) => {
        const num = Number(item);
        if (!Number.isFinite(num)) {
          throw new Error(`${name} embedding has non-numeric value.`);
        }
        return num;
      });
      return normalized;
    };

    /**
 * @param {unknown} response
 * @returns {unknown}
 */
/**
 * @param {unknown} response
 * @returns {unknown}
 */
const extractVectors = function (response) {
      if (!response) return null;
      if (Array.isArray(response.data)) {
        return response.data.map((item) => item?.embedding ?? null);
      }
      if (Array.isArray(response.embeddings)) {
        return response.embeddings;
      }
      return null;
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

      const overview = normalizeText(publication?.overview, 'overview', publicationId);
      const annotation = normalizeText(publication?.annotation, 'annotation', publicationId);

      const existing = await embeddingStore.findByPublicationId(publicationId);
      if (existing?.overview_embedding && existing?.annotation_embedding) {
        logger.info(NAMESPACE, `Publication ${publicationId} already has embeddings.`);
        return;
      }

      if (statusCatalog?.EMBEDDING_PENDING) {
        await publicationStore.updateStatus({ id: publicationId, status: statusCatalog.EMBEDDING_PENDING });
      }

      const response = await embeddingClient.embed([annotation, overview]);
      const vectors = extractVectors(response);
      if (!Array.isArray(vectors) || vectors.length < 2) {
        throw new Error(`Publication ${publicationId} embeddings response is invalid.`);
      }

      const annotationEmbedding = normalizeVector(vectors[0], 'Annotation');
      const overviewEmbedding = normalizeVector(vectors[1], 'Overview');

      await embeddingStore.saveEmbeddings({
        publicationId,
        overviewEmbedding,
        annotationEmbedding,
      });

      if (statusCatalog?.EMBEDDING_DONE) {
        await publicationStore.updateStatus({ id: publicationId, status: statusCatalog.EMBEDDING_DONE });
      }
      logger.info(NAMESPACE, `Embeddings generated for publication ${publicationId}.`);
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
      if (Number.isFinite(Number(publicationId)) && statusCatalog?.EMBEDDING_FAILED) {
        await publicationStore.updateStatus({ id: publicationId, status: statusCatalog.EMBEDDING_FAILED });
      }
    };

    /**
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
this.execute = async function () {
      logger.info(NAMESPACE, 'Embedding generation started.');
      const limit = 3;
      const batch = await publicationStore.listForEmbeddings({ limit });
      if (!Array.isArray(batch) || !batch.length) {
        logger.info(NAMESPACE, 'Embedding generation finished with no work.');
        return;
      }

      const total = batch.length;
      let processed = 0;
      let failures = 0;

      for (const publication of batch) {
        const publicationId = publication?.id;
        try {
          await processPublication(publication);
        } catch (err) {
          failures += 1;
          await handleError(publicationId, err);
        } finally {
          processed += 1;
          logger.info(NAMESPACE, `Processed ${processed}/${total} publications.`);
        }
      }

      if (failures > 0) {
        logger.warn(NAMESPACE, `Embedding generation finished with ${failures} error(s).`);
      } else {
        logger.info(NAMESPACE, 'Embedding generation finished successfully.');
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    logger: 'Mindstream_Back_Logger$',
    embeddingClient: 'Mindstream_Back_Integration_OpenAi$',
    publicationStore: 'Mindstream_Back_Process_Publication_Store$',
    embeddingStore: 'Mindstream_Back_Process_Publication_EmbeddingStore$',
    statusCatalog: 'Mindstream_Back_Process_Publication_Status$',
  }),
});

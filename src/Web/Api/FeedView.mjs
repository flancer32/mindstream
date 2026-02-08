/**
 * @module Mindstream_Back_Web_Api_FeedView
 * @description Handles /api/feed requests and builds Feed View DTO.
 */
export default class Mindstream_Back_Web_Api_FeedView {
  constructor({
    Mindstream_Back_Storage_Knex$: knexProvider,
    Mindstream_Shared_Logger$: logger,
    Fl32_Web_Back_Helper_Respond$: respond,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Api_FeedView';
    const MAX_ITEMS = 50;

    const getKnex = function () {
      return knexProvider.get();
    };

    const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    const normalizeCursor = function (cursor) {
      if (!cursor) return null;
      if (typeof cursor !== 'object') {
        throw new Error('Cursor must be an object.');
      }
      const id = Number(cursor.id);
      if (!Number.isFinite(id)) {
        throw new Error('Cursor id must be a number.');
      }
      let publishedAt = null;
      if (cursor.publishedAt !== undefined) {
        if (typeof cursor.publishedAt !== 'string' || !cursor.publishedAt.trim()) {
          throw new Error('Cursor publishedAt must be a non-empty string.');
        }
        publishedAt = cursor.publishedAt.trim();
      }
      return { id, publishedAt };
    };

    const normalizePublishedAt = function (value) {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new Error('PublishedAt is invalid.');
      }
      return date.toISOString();
    };

    const normalizeTitle = function (value) {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    };

    const normalizeText = function (value, name) {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${name} must be a non-empty string.`);
      }
      return value;
    };

    const normalizeUrl = function (value, name) {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${name} must be a non-empty string.`);
      }
      return value;
    };

    const normalizeVector = function (value, name) {
      if (Array.isArray(value)) {
        const normalized = value.map((item) => {
          const num = Number(item);
          if (!Number.isFinite(num)) {
            throw new Error(`${name} must contain only numbers.`);
          }
          return num;
        });
        if (!normalized.length) {
          throw new Error(`${name} must be a non-empty array.`);
        }
        return normalized;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
          throw new Error(`${name} must be a non-empty vector string.`);
        }
        let raw = trimmed;
        if (raw.startsWith('[') && raw.endsWith(']')) {
          raw = raw.slice(1, -1);
        }
        const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
        if (!parts.length) {
          throw new Error(`${name} must be a non-empty vector.`);
        }
        return parts.map((part) => {
          const num = Number(part);
          if (!Number.isFinite(num)) {
            throw new Error(`${name} must contain only numbers.`);
          }
          return num;
        });
      }
      throw new Error(`${name} must be a vector array or string.`);
    };

    const applyCursorFilter = function (query, cursor) {
      if (!cursor) return;
      if (cursor.publishedAt) {
        query.where(function () {
          this.where('p.rss_published_at', '<', cursor.publishedAt)
            .orWhere(function () {
              this.where('p.rss_published_at', '=', cursor.publishedAt)
                .andWhere('p.id', '<', cursor.id);
            });
        });
        return;
      }
      query.where('p.id', '<', cursor.id);
    };

    const buildQuery = function (cursor) {
      const query = getKnex()('publications as p')
        .join('publication_summaries as s', 'p.id', 's.publication_id')
        .join('publication_embeddings as e', 'p.id', 'e.publication_id')
        .join('publication_sources as src', 'p.source_id', 'src.id')
        .select(
          'p.id as id',
          'p.rss_title as title',
          'p.source_url as publication_url',
          'p.rss_published_at as published_at',
          's.annotation as annotation',
          's.overview as overview',
          'e.annotation_embedding as annotation_embedding',
          'e.overview_embedding as overview_embedding',
          'src.code as source_code',
          'src.name as source_name',
          'src.url as source_url'
        )
        .whereNotNull('p.rss_published_at')
        .whereNotNull('s.annotation')
        .whereNotNull('s.overview')
        .whereNotNull('e.annotation_embedding')
        .whereNotNull('e.overview_embedding')
        .orderBy('p.rss_published_at', 'desc')
        .orderBy('p.id', 'desc')
        .limit(MAX_ITEMS);

      applyCursorFilter(query, cursor);
      return query;
    };

    const mapRow = function (row) {
      if (!row || typeof row !== 'object') {
        throw new Error('Feed row is invalid.');
      }
      const id = Number(row.id);
      if (!Number.isFinite(id)) {
        throw new Error('Feed item id must be a number.');
      }
      const sourceCode = normalizeText(row.source_code, 'Source code');
      const sourceName = normalizeText(row.source_name, 'Source name');
      const sourceUrl = normalizeUrl(row.source_url, 'Source url');
      const url = normalizeUrl(row.publication_url, 'Publication url');
      const annotation = normalizeText(row.annotation, 'Annotation');
      const overview = normalizeText(row.overview, 'Overview');
      const publishedAt = normalizePublishedAt(row.published_at);
      const title = normalizeTitle(row.title);
      const annotationEmbedding = normalizeVector(row.annotation_embedding, 'Annotation embedding');
      const overviewEmbedding = normalizeVector(row.overview_embedding, 'Overview embedding');

      return {
        item: {
          id,
          sourceCode,
          title,
          url,
          publishedAt,
          annotation,
          overview,
          embeddings: {
            annotation: annotationEmbedding,
            overview: overviewEmbedding,
          },
        },
        source: {
          code: sourceCode,
          name: sourceName,
          url: sourceUrl,
        },
      };
    };

    const parseQuery = function (url) {
      if (!url) return {};
      const raw = String(url);
      const questionIndex = raw.indexOf('?');
      if (questionIndex < 0) return {};
      const queryPart = raw.slice(questionIndex + 1);
      const params = new Map();
      for (const pair of queryPart.split('&')) {
        if (!pair) continue;
        const [keyRaw, valueRaw] = pair.split('=');
        if (!keyRaw) continue;
        const key = decodeURIComponent(keyRaw);
        const value = valueRaw ? decodeURIComponent(valueRaw) : '';
        params.set(key, value);
      }
      return Object.fromEntries(params.entries());
    };

    const buildCursorFromQuery = function (query) {
      const idValue = query?.id;
      if (idValue === undefined || idValue === null || idValue === '') return null;
      const id = Number(idValue);
      if (!Number.isFinite(id)) {
        throw new Error('Cursor id must be a number.');
      }
      const publishedAt = query?.publishedAt;
      if (publishedAt !== undefined && publishedAt !== null && publishedAt !== '') {
        if (typeof publishedAt !== 'string') {
          throw new Error('Cursor publishedAt must be a string.');
        }
        return normalizeCursor({ id, publishedAt });
      }
      return normalizeCursor({ id });
    };

    this.getFeedView = async function ({ cursor } = {}) {
      const normalizedCursor = normalizeCursor(cursor);
      const rows = await buildQuery(normalizedCursor);
      const mapped = (rows ?? []).map(mapRow);
      const sliced = mapped.slice(0, MAX_ITEMS);
      const sourcesMap = new Map();
      const items = [];

      for (const entry of sliced) {
        items.push(entry.item);
        if (!sourcesMap.has(entry.source.code)) {
          sourcesMap.set(entry.source.code, entry.source);
        }
      }

      const sources = Array.from(sourcesMap.values());
      if (!items.length) {
        return { sources: [], items: [] };
      }

      const last = items[items.length - 1];
      return {
        sources,
        items,
        cursor: {
          publishedAt: last.publishedAt,
          id: last.id,
        },
      };
    };

    this.handle = async function ({ req, res }) {
      try {
        const query = parseQuery(req?.url);
        const cursor = buildCursorFromQuery(query);
        const payload = await this.getFeedView({ cursor });
        respond.code200_Ok({
          res,
          headers: { 'content-type': 'application/json' },
          body: payload,
        });
        return true;
      } catch (err) {
        const error = ensureError(err);
        if (logger?.exception) {
          logger.exception(NAMESPACE, error);
        }
        throw error;
      }
    };
  }
}

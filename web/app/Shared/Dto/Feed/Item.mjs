/**
 * Feed item DTO.
 */
export default class Mindstream_Shared_Dto_Feed_Item {
  /** @type {number} */
  id;

  /** @type {string} */
  sourceCode;

  /** @type {string | undefined} */
  title;

  /** @type {string} */
  url;

  /** @type {string | undefined} */
  publishedAt;

  /** @type {string} */
  annotation;

  /** @type {string} */
  overview;

  /**
   * @type {{
   *   annotation: number[];
   *   overview: number[];
   * }}
   */
  embeddings;
}

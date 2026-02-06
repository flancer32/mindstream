/**
 * Feed view DTO.
 */
export default class Mindstream_Shared_Dto_Feed_View {
  /** @type {Mindstream_Shared_Dto_SourceDictionary_Item[]} */
  sources;

  /** @type {Mindstream_Shared_Dto_Feed_Item[]} */
  items;

  /**
   * @type {{
   *   publishedAt: (string | undefined);
   *   id: number;
   * } | undefined}
   */
  cursor;
}

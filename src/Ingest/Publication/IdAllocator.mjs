// @ts-check

/** @namespace Mindstream_Back_Ingest_Publication_IdAllocator */
export default class Mindstream_Back_Ingest_Publication_IdAllocator {
  constructor() {
    /** @param {unknown} trx */
    this.ensure = async function (trx) {
      await trx.raw('CREATE SEQUENCE IF NOT EXISTS mindstream_publication_id_seq');
      const sequence = (await trx.raw('SELECT last_value, is_called FROM mindstream_publication_id_seq')).rows[0];
      if (!sequence) throw new Error('Publication ID sequence is unavailable.');

      const highest = await trx('mindstream_publication')
        .select(trx.raw('CAST(MAX(??) AS TEXT) AS value', ['id']))
        .first();
      const maximumId = BigInt(highest?.value ?? '0');
      const lastValue = BigInt(sequence.last_value);
      if (maximumId > lastValue || maximumId === lastValue && maximumId > 0n && !sequence.is_called) {
        await trx.raw("SELECT setval('mindstream_publication_id_seq', ?, true)", [maximumId.toString()]);
      }
    };

    /** @param {unknown} trx @param {number} count */
    this.allocate = async function (trx, count) {
      if (!Number.isSafeInteger(count) || count < 1) throw new TypeError('A positive publication ID count is required.');

      await this.ensure(trx);

      /** @type {string[]} */
      const ids = [];
      for (let index = 0; index < count; index++) {
        const result = await trx.raw("SELECT nextval('mindstream_publication_id_seq')::text AS id");
        const id = result.rows[0]?.id;
        if (!id) throw new Error('Publication ID allocation failed.');
        ids.push(String(id));
      }
      return ids;
    };
  }
}

export const __deps__ = Object.freeze({default: Object.freeze({})});

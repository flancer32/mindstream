import assert from 'node:assert/strict';
import test from 'node:test';
import { createTestContainer } from '../../di-node.mjs';

const article = (overrides = {}) => ({source: {id: 2, code: 'journal', name: 'Journal', url: 'https://example.org/'}, url: 'https://example.org/a', title: 'An article', publishedAt: '2026-09-07T09:00:00Z', markdown: 'Prepared article text.', ...overrides});

async function setup({duplicate = false, conflict = false, extractionFails = false} = {}) {
  const container = await createTestContainer();
  /** @type {Array<{table: string, data: Record<string, unknown>}>} */
  const rows = [];
  /** @type {string[]} */
  const outcomes = [];
  const database = {get: () => ({transaction: async (/** @type {(query: (table: string) => object) => Promise<unknown>} */ callback) => {
    const trx = (/** @type {string} */ table) => ({
      insert: (/** @type {Record<string, unknown>} */ data) => {
        rows.push({table, data});
        if (table === 'mindstream_extraction') {
          if (extractionFails) throw new Error('Storage unavailable');
          return Promise.resolve();
        }
        return {
          onConflict: () => ({
            ignore: () => table === 'mindstream_publication'
              ? {returning: async () => duplicate ? [] : [{id: data.id}]}
              : Promise.resolve(),
          }),
        };
      },
      where: () => ({first: async () => ({...article().source, code: conflict ? 'other' : 'journal'})}),
      select: () => ({first: async () => ({ value: '11' })}),
    });
    trx.raw = async () => ({ rows: [] });
    try { const result = await callback(trx); outcomes.push('commit'); return result; }
    catch (error) { outcomes.push('rollback'); throw error; }
  }})};
  container.register('Mindstream_Back_Storage_Database$', database);
  container.register('Mindstream_Back_Logger$', {info() {}, exception() {}});
  container.register('node:crypto', {createHash: () => ({update: () => ({digest: () => 'a'.repeat(64)})})});
  container.register('Mindstream_Back_Ingest_Publication_IdAllocator$', {allocate: async (_trx, count) => Array.from({length: count}, (_item, index) => String(12 + index))});
  return {service: await container.get('Mindstream_Back_Ingest_Import$'), rows, outcomes};
}

test('imports attributed external text atomically into the existing extracted stage', async () => {
  const {service, rows, outcomes} = await setup();
  assert.deepEqual(await service.execute(article()), {created: true, id: '12'});
  const publication = rows.find(row => row.table === 'mindstream_publication');
  const extraction = rows.find(row => row.table === 'mindstream_extraction');
  assert.equal(publication.data.status, 'extracted');
  assert.equal(publication.data.source_id, 2);
  assert.equal(extraction.data.publication_id, '12');
  assert.equal(extraction.data.md_text, article().markdown);
  assert.deepEqual(outcomes, ['commit']);
});

test('duplicate imports leave existing article text untouched', async () => {
  const {service, rows} = await setup({duplicate: true});
  assert.deepEqual(await service.execute(article()), {created: false});
  assert.equal(rows.some(row => row.table === 'mindstream_extraction'), false);
});

test('rejects expired manual imports and uses discovery time when publication date is absent', async () => {
  const expired = await setup();
  await assert.rejects(expired.service.execute(article({publishedAt: '2000-01-01T00:00:00Z'})), /outside the 100-day retention period/);
  assert.equal(expired.rows.length, 0);
  assert.equal(expired.outcomes.length, 0);

  const undated = await setup();
  assert.deepEqual(await undated.service.execute(article({publishedAt: undefined})), {created: true, id: '12'});
  const publication = undated.rows.find((row) => row.table === 'mindstream_publication');
  assert.equal(publication.data.rss_published_at, null);
  assert.ok(publication.data.discovered_at);
});

test('conflicting source attribution and extraction failures abort the transaction', async () => {
  for (const options of [{conflict: true}, {extractionFails: true}]) {
    const {service, outcomes} = await setup(options);
    await assert.rejects(service.execute(article()));
    assert.deepEqual(outcomes, ['rollback']);
  }
});

test('invalid input is rejected before any storage operation', async () => {
  const cases = [null, {...article(), markdown: ''}, {...article(), url: 'javascript:alert(1)'}, {...article(), url: 'https://user:password@example.org/'}, {...article(), publishedAt: 'yesterday'}, {...article(), source: {...article().source, id: 1}}, {...article(), source: {...article().source, code: 'habr'}}];
  for (const input of cases) {
    const {service, rows, outcomes} = await setup();
    await assert.rejects(service.execute(input));
    assert.equal(rows.length, 0);
    assert.equal(outcomes.length, 0);
  }
});

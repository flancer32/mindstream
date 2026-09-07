import assert from 'node:assert/strict';
import test from 'node:test';
import { createTestContainer } from '../../../di-node.mjs';

test('import delegates parsed JSON and closes the file on success or failure', async () => {
  for (const content of ['{"title":"Article"}', 'invalid JSON']) {
    const container = await createTestContainer();
    /** @type {unknown[]} */
    const imported = [];
    let closed = false;
    container.register('Mindstream_Back_Ingest_Import$', {execute: async (/** @type {unknown} */ value) => imported.push(value)});
    container.register('node:fs/promises', {open: async () => ({stat: async () => ({isFile: () => true, size: 100}), readFile: async () => content, close: async () => { closed = true; }})});
    const command = await container.get('Mindstream_Back_Cli_Ingest_Import$');
    assert.equal(command.id, 'ingest:import');
    assert.equal(command.arguments[0].required, true);
    if (content === 'invalid JSON') await assert.rejects(command.execute({args: {file: 'article.json'}}));
    else { await command.execute({args: {file: 'article.json'}}); assert.deepEqual(imported, [{title: 'Article'}]); }
    assert.equal(closed, true);
  }
});

test('oversized files are rejected without reading or importing', async () => {
  const container = await createTestContainer();
  let closed = false;
  container.register('Mindstream_Back_Ingest_Import$', {execute: async () => assert.fail('must not import')});
  container.register('node:fs/promises', {open: async () => ({stat: async () => ({isFile: () => true, size: 2_000_001}), readFile: async () => assert.fail('must not read'), close: async () => { closed = true; }})});
  const command = await container.get('Mindstream_Back_Cli_Ingest_Import$');
  await assert.rejects(command.execute({args: {file: 'large.json'}}), /at most 2 MB/);
  assert.equal(closed, true);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream DEM v2 compiles to the existing PostgreSQL table layout', async () => {
  const container = await createTestContainer();
  const schema = await container.get('Mindstream_Back_Storage_Schema$');
  const declaration = schema.getDeclaration();
  assert.equal(declaration.version, 2);
  assert.ok(declaration.requires.includes('postgresql.extension.vector'));
  assert.deepEqual(Object.keys(declaration.entity).sort(), [
    'anonymous_identities', 'attention_states', 'publication_embeddings', 'publication_extractions',
    'publication_sources', 'publication_summaries', 'publications', 'schema_version',
  ]);
  assert.equal(declaration.entity.publication_embeddings.attr.overview_embedding.type.params.dimensions, 1536);
  assert.deepEqual(declaration.entity.attention_states.index.pk.keys.map((item) => item.attr), [
    'identity_id', 'publication_id', 'attention_type',
  ]);

  const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');
  const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$');
  const result = await compiler.exec({
    adapter, fragments: [schema.getFragmentEnvelope()], mapEnvelope: schema.getMapEnvelope(),
  });
  compiler.assertResult({ value: result });
  assert.deepEqual(result.physical.tables.map((table) => table.name).sort(), Object.keys(declaration.entity).sort());
  assert.equal(result.physical.adapter, 'postgresql');
  assert.ok(result.fingerprint);
});

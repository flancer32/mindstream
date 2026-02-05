import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_Storage_Schema exposes publication_sources table', async () => {
  const container = await createTestContainer();
  const schema = await container.get('Mindstream_Back_Storage_Schema$');
  const declaration = schema.getDeclaration();

  assert.ok(declaration.tables);
  assert.ok(declaration.tables.schema_version);
  assert.ok(declaration.tables.publication_sources);

  const columns = declaration.tables.publication_sources.columns;
  assert.ok(columns.id);
  assert.ok(columns.code);
  assert.ok(columns.url);
  assert.ok(columns.name);
  assert.ok(columns.description);
  assert.ok(columns.is_active);
  assert.ok(columns.created_at);
  assert.ok(columns.updated_at);
});

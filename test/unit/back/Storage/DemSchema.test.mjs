import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import Container from '@teqfw/di';

const projectRoot = path.resolve(import.meta.dirname, '../../../../');
const demRoot = path.join(projectRoot, 'node_modules/@teqfw/dem');
const demRdbRoot = path.join(projectRoot, 'node_modules/@teqfw/dem-rdb');

test('DEM 2 schema composes the MindStream storage model with infrastructure history', async () => {
  const container = new Container({
    namespaces: [
      { prefix: 'TeqFw_Dem_', target: path.join(demRoot, 'src'), defaultExt: '.mjs' },
      { prefix: 'TeqFw_Dem_RDb_', target: path.join(demRdbRoot, 'src'), defaultExt: '.mjs' },
    ],
  });
  const registry = await container.get('TeqFw_Dem_Registry$');
  const vectorTypes = await container.get('TeqFw_Dem_RDb_Type_Vector_Provider$');
  registry.register(vectorTypes.getDefinitions());
  registry.finalize();

  const acquisition = await container.get('TeqFw_Dem_Acquire$');
  const inputs = await acquisition.exec({ hostRoot: projectRoot });
  const compiler = await container.get('TeqFw_Dem_Compile$');
  const result = await compiler.exec(inputs);
  compiler.assertResult({ value: result });

  assert.deepEqual(Object.keys(result.model.entities).sort(), [
    '/dem/application', '/dem/snapshot', '/mindstream/attention', '/mindstream/embedding',
    '/mindstream/extraction', '/mindstream/identity', '/mindstream/publication', '/mindstream/source',
    '/mindstream/summary',
  ]);
  assert.deepEqual(result.model.entities['/mindstream/source'].primaryKey, ['id']);
  assert.deepEqual(result.model.entities['/mindstream/source'].uniqueKeys, {
    code: ['code'], url: ['url'],
  });
  assert.deepEqual(result.model.entities['/mindstream/publication'].uniqueKeys, {
    source_item: ['source_id', 'source_item_hash'],
  });
  assert.deepEqual(result.model.entities['/mindstream/identity'].uniqueKeys, {
    identity_uuid: ['identity_uuid'],
  });
  assert.deepEqual(result.model.entities['/mindstream/attention'].primaryKey, [
    'identity_id', 'publication_id', 'attention_type',
  ]);
  assert.deepEqual(result.model.entities['/mindstream/attention'].attributes[2].type.params.values, [
    'link_click', 'link_click_after_overview', 'overview_view',
  ]);
  assert.equal(result.model.entities['/mindstream/attention'].relations.identity.target.path, '/mindstream/identity');
  const embedding = result.model.entities['/mindstream/embedding'];
  assert.deepEqual(embedding.attributes.slice(1, 3).map(({ type }) => ({ name: type.name, params: type.params })), [
    { name: 'teqfw.dem_rdb.vector', params: { dimensions: 1536 } },
    { name: 'teqfw.dem_rdb.vector', params: { dimensions: 1536 } },
  ]);
  assert.deepEqual(result.model.entities['/mindstream/source'].attributes[0].type.profile, {
    capacity: 'large', type: 'int',
  });
  for (const entity of Object.values(result.model.entities)) {
    for (const attribute of entity.attributes) {
      if (attribute.type.name === 'datetime') assert.equal(attribute.type.params.precision, 6, attribute.name);
    }
  }
  assert.equal(result.model.entities['/mindstream/source'].attributes[0].generation, true);
  let relationCount = 0;
  for (const [path, entity] of Object.entries(result.model.entities)) {
    if (!path.startsWith('/mindstream/')) continue;
    for (const [name, relation] of Object.entries(entity.relations)) {
      assert.equal(relation.onUpdate, 'cascade', `${path}.${name}`);
      const expectedDelete = path === '/mindstream/publication' ? 'restrict' : 'cascade';
      assert.equal(relation.onDelete, expectedDelete);
      relationCount++;
    }
  }
  assert.equal(relationCount, 6);
  assert.deepEqual(embedding.primaryKey, ['publication_id']);
  assert.deepEqual(result.model.entities['/mindstream/attention'].attributes[2].type.params.values, [
    'link_click', 'link_click_after_overview', 'overview_view',
  ]);
  assert.equal(result.model.entities['/dem/snapshot'] !== undefined, true);
  assert.equal(result.model.entities['/dem/application'] !== undefined, true);
});

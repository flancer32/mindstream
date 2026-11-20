import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import Container from '@teqfw/di';

const projectRoot = path.resolve(import.meta.dirname, '../../../../');
const demRoot = path.join(projectRoot, 'node_modules/@teqfw/dem');

test('DEM 2 schema composes the MindStream storage model with infrastructure history', async () => {
  const container = new Container({
    namespaces: [{ prefix: 'TeqFw_Dem_', target: path.join(demRoot, 'src'), defaultExt: '.mjs' }],
  });
  const registry = await container.get('TeqFw_Dem_Registry$');
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
  assert.deepEqual(result.model.entities['/mindstream/attention'].primaryKey, [
    'identity_id', 'publication_id', 'attention_type',
  ]);
  assert.deepEqual(result.model.entities['/mindstream/attention'].attributes[2].type.params.values, [
    'link_click', 'link_click_after_overview', 'overview_view',
  ]);
  assert.equal(result.model.entities['/mindstream/attention'].relations.identity.target.path, '/mindstream/identity');
  assert.deepEqual(result.model.entities['/mindstream/embedding'].attributes[1].type.params, {
    dimensions: 1536, element: 'float', sparse: false,
  });
  assert.deepEqual(result.model.entities['/mindstream/source'].attributes[0].type.profile, {
    capacity: 'large', type: 'int',
  });
  assert.equal(result.model.entities['/mindstream/source'].attributes[6].type.params.precision, 6);
});

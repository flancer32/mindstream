import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
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

  const compiler = await container.get('TeqFw_Dem_Compile$');
  const infrastructure = JSON.parse(await fs.readFile(path.join(demRoot, 'etc/dem-schema.json'), 'utf8'));
  const declaration = JSON.parse(await fs.readFile(path.join(projectRoot, 'etc/dem-schema.json'), 'utf8'));
  const map = JSON.parse(await fs.readFile(path.join(projectRoot, 'etc/dem-map.json'), 'utf8'));
  const result = await compiler.exec({
    schemas: [
      { packageName: '@teqfw/dem', filename: 'etc/dem-schema.json', document: infrastructure },
      { packageName: '@flancer32/mindstream', filename: 'etc/dem-schema.json', document: declaration },
    ],
    map: { packageName: '@flancer32/mindstream', filename: 'etc/dem-map.json', document: map },
    trustedPackages: ['@teqfw/dem'],
  });
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

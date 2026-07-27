import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-node.mjs';

const createBrowser = ({ response } = {}) => {
  const calls = [];
  const beacons = [];
  return {
    URL,
    Blob,
    fetch: async (url, options) => {
      calls.push({ url, options });
      return response;
    },
    getLocation: () => ({ origin: 'https://mindstream.test' }),
    getNavigator: () => ({ sendBeacon: (url, body) => { beacons.push({ url, body }); return true; } }),
    calls,
    beacons,
  };
};

const feedResponse = Object.freeze({
  sources: [{ code: 'habr', name: 'Habr', url: 'https://habr.com/' }],
  items: [{
    id: 4,
    sourceCode: 'habr',
    url: 'https://habr.com/post/4',
    annotation: 'Annotation',
    overview: 'Overview',
    embeddings: { annotation: [1], overview: [1] },
  }],
  cursor: { id: 4 },
});

test('Mindstream_Web_Transport_Feed requests a cursor page and validates its DTO', async () => {
  const browser = createBrowser({ response: { ok: true, json: async () => feedResponse } });
  const container = await createTestContainer();
  container.register('Mindstream_Web_Platform_Browser$', browser);
  const transport = await container.get('Mindstream_Web_Transport_Feed$');

  const result = await transport.getPage({ cursor: { id: 9, publishedAt: '2026-07-27T00:00:00.000Z' } });

  assert.equal(result.items[0].id, 4);
  assert.match(browser.calls[0].url, /id=9/u);
  assert.match(browser.calls[0].url, /publishedAt=2026-07-27T00%3A00%3A00.000Z/u);
});

test('Mindstream_Web_Transport_Beacon sends only a transport payload', async () => {
  const browser = createBrowser();
  const container = await createTestContainer();
  container.register('Mindstream_Web_Platform_Browser$', browser);
  const beacon = await container.get('Mindstream_Web_Transport_Beacon$');

  assert.equal(beacon.sendJson('/api/identity', { identity: 'id' }), true);
  assert.equal(browser.beacons[0].url, 'https://mindstream.test/api/identity');
});

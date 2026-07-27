import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-node.mjs';

const createStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
};

const createBrowser = () => {
  const storage = createStorage();
  const definitions = new Map();
  class Element { constructor() { this.classList = { add() {}, toggle() {} }; } }
  const customElements = { get: (name) => definitions.get(name), define: (name, value) => definitions.set(name, value) };
  return {
    HTMLElement: Element,
    IntersectionObserver: class {},
    URL,
    Blob,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    document: {},
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    getStorage: () => storage,
    getNavigator: () => ({ sendBeacon: () => true }),
    getLocation: () => ({ origin: 'https://mindstream.test' }),
    getWindow: () => ({ customElements, confirm: () => true }),
    addEventListener() {},
    removeEventListener() {},
    definitions,
  };
};

test('browser application links services and component definitions through DI', async () => {
  const container = await createTestContainer();
  const browser = createBrowser();
  container.register('Mindstream_Web_Platform_Browser$', browser);

  const app = await container.get('Mindstream_Web_App$');
  app.start();

  assert.ok(browser.definitions.get('mindstream-feed'));
  assert.ok(browser.definitions.get('mindstream-identity-menu'));

  const identity = await container.get('Mindstream_Web_Identity$');
  assert.equal(identity.activateIdentity(), '00000000-0000-4000-8000-000000000000');

  const attention = await container.get('Mindstream_Web_Attention$');
  attention.init({ dim: 2 });
  await attention.recordAttention({ type: 'overview_open', pubId: 7 }, [1, 0]);
  assert.ok(attention.hasInterestProfile());
  assert.ok(attention.scorePublication([1, 0]) > .5);
});

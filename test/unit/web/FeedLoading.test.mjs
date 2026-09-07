import assert from 'node:assert/strict';
import test from 'node:test';
import { createTestContainer } from '../di-node.mjs';

class Element {
  constructor() { this.hidden = false; this.textContent = ''; this.children = /** @type {Element[]} */ ([]); this.events = new Map(); }
  setAttribute() {}
  append(/** @type {Element} */ child) { this.children.push(child); }
  addEventListener(/** @type {string} */ name, /** @type {() => unknown} */ callback) { this.events.set(name, callback); }
}

async function setup(/** @type {object} */ transport, href = 'https://mindstream.test/') {
  const container = await createTestContainer();
  container.register('Mindstream_Web_Platform_Browser$', {HTMLElement: Element, URL, getLocation: () => ({href}), document: {createElement: () => new Element()}});
  container.register('Mindstream_Web_Transport_Feed$', transport);
  container.register('Mindstream_Web_InterestFilter$', {defaults: {enabled: false}});
  container.register('Mindstream_Web_InterestIndicator$', {});
  container.register('Mindstream_Web_InterestScore$', {initAttention() {}, hasInterestProfile: () => false});
  const Feed = await container.get('Mindstream_Web_Component_Feed$');
  const feed = new Feed();
  feed._status = new Element();
  feed._appendItems = (/** @type {Array<{id: number}>} */ items) => { for (const item of items) { feed._state.items.set(item.id, item); feed._state.cards.set(item.id, {hidden: false}); } };
  feed._refreshProjection = () => feed._updateStatus('');
  return feed;
}

test('failed pagination retains articles and cursor, then permits an explicit retry', async () => {
  let calls = 0;
  const cursor = {id: 1, publishedAt: '2026-09-07T00:00:00Z'};
  const feed = await setup({getPage: async (/** @type {{cursor?: object}} */ options) => {
    calls++;
    if (calls === 1) return {sources: [], items: [{id: 1}], cursor};
    assert.deepEqual(options.cursor, cursor);
    if (calls === 2) throw new Error('Connection lost');
    return {sources: [], items: [{id: 2}]};
  }});
  await feed._loadMore();
  await feed._loadMore();
  assert.equal(feed._state.items.size, 1);
  assert.equal(feed._state.done, false);
  assert.match(feed._status.textContent, /keep reading/);
  assert.equal(feed._status.children.at(-1).textContent, 'Try again');
  await feed._loadMore();
  assert.equal(calls, 2, 'observer callbacks must not repeatedly retry failures');
  await feed._status.children.at(-1).events.get('click')();
  assert.equal(feed._state.items.size, 2);
  assert.equal(feed._state.done, true);
});

test('permalink view never loads a feed page and can recover from a failed request', async () => {
  let calls = 0;
  const feed = await setup({getPage: () => assert.fail('permalink must not paginate'), getPublication: async (/** @type {number} */ id) => {
    assert.equal(id, 7);
    if (++calls === 1) throw new Error('Connection lost');
    return {sources: [], items: [{id: 7}]};
  }}, 'https://mindstream.test/?publication=7');
  await feed._loadMore();
  await feed._loadInitial();
  assert.equal(feed._loadFailed, true);
  await feed._status.children.at(-1).events.get('click')();
  assert.equal(feed._state.items.has(7), true);
});

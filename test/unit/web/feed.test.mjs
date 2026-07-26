import assert from 'node:assert/strict';
import path from 'node:path';
import test, { after } from 'node:test';
import { pathToFileURL } from 'node:url';

const modulePath = path.resolve('web/ui/js/feed.mjs');
const changedGlobalNames = [
  'CustomEvent',
  'HTMLElement',
  'IntersectionObserver',
  'addEventListener',
  'customElements',
  'document',
  'fetch',
  'localStorage',
  'location',
  'navigator',
  'removeEventListener',
  'window',
];
const originalGlobalDescriptors = new Map(
  changedGlobalNames.map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ])
);

after(() => {
  for (const [name, descriptor] of originalGlobalDescriptors.entries()) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
});

class FakeClassList {
  constructor(owner) {
    this.owner = owner;
    this.tokens = new Set();
  }

  _syncFromString(value) {
    this.tokens = new Set(String(value || '').split(/\s+/u).filter(Boolean));
  }

  _syncToOwner() {
    this.owner._className = Array.from(this.tokens).join(' ');
  }

  add(...tokens) {
    for (const token of tokens) this.tokens.add(token);
    this._syncToOwner();
  }

  contains(token) {
    return this.tokens.has(token);
  }

  toggle(token, force) {
    const next = force === undefined ? !this.tokens.has(token) : Boolean(force);
    if (next) this.tokens.add(token);
    else this.tokens.delete(token);
    this._syncToOwner();
    return next;
  }
}

class FakeNode {
  constructor(tagName = '') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.style = {};
    this.attributes = new Map();
    this.eventListeners = new Map();
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.open = false;
    this.type = '';
    this.value = '';
    this._className = '';
    this._textContent = '';
    this.classList = new FakeClassList(this);
  }

  get className() {
    return this._className;
  }

  set className(value) {
    this._className = String(value || '');
    this.classList._syncFromString(this._className);
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
  }

  addEventListener(type, handler) {
    if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
    this.eventListeners.get(type).push(handler);
  }

  append(...nodes) {
    for (const node of nodes) this.appendChild(node);
  }

  appendChild(node) {
    if (node instanceof FakeFragment) {
      for (const child of [...node.children]) this.appendChild(child);
      return node;
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  contains(node) {
    if (node === this) return true;
    return this.children.some((child) => child.contains?.(node));
  }

  dispatchEvent(event) {
    const handlers = this.eventListeners.get(event.type) || [];
    for (const handler of handlers) handler(event);
    if (event.bubbles && this.parentNode) this.parentNode.dispatchEvent(event);
    return true;
  }

  focus() {}

  insertBefore(node, referenceNode) {
    if (node instanceof FakeFragment) {
      for (const child of [...node.children]) this.insertBefore(child, referenceNode);
      return node;
    }
    const index = this.children.indexOf(referenceNode);
    node.parentNode = this;
    this.children.splice(index < 0 ? this.children.length : index, 0, node);
    return node;
  }

  removeEventListener(type, handler) {
    const handlers = this.eventListeners.get(type) || [];
    this.eventListeners.set(type, handlers.filter((entry) => entry !== handler));
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

class FakeFragment extends FakeNode {}

class FakeDocument {
  constructor(registry) {
    this.registry = registry;
    this.eventListeners = new Map();
  }

  addEventListener(type, handler) {
    if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
    this.eventListeners.get(type).push(handler);
  }

  createDocumentFragment() {
    return new FakeFragment('#fragment');
  }

  createElement(tagName) {
    const Constructor = this.registry.get(tagName);
    return Constructor ? new Constructor() : new FakeNode(tagName);
  }

  removeEventListener(type, handler) {
    const handlers = this.eventListeners.get(type) || [];
    this.eventListeners.set(type, handlers.filter((entry) => entry !== handler));
  }
}

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.detail = options.detail;
  }
}

const createStorage = (seed = {}) => {
  const data = new Map(Object.entries(seed).map(([key, value]) => [key, String(value)]));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
  };
};

const collectByClass = (node, className, result = []) => {
  if (node.classList?.contains(className)) result.push(node);
  for (const child of node.children || []) collectByClass(child, className, result);
  return result;
};

const waitFor = async (predicate) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  throw new Error('Timed out waiting for feed rendering.');
};

test('feed uses one Web Component threshold for highlighting and optional hiding', async () => {
  const registry = new Map();
  globalThis.HTMLElement = FakeNode;
  globalThis.CustomEvent = FakeCustomEvent;
  globalThis.customElements = {
    define(name, Constructor) {
      registry.set(name, Constructor);
    },
    get(name) {
      return registry.get(name);
    },
  };
  globalThis.document = new FakeDocument(registry);
  globalThis.window = {
    confirm: () => true,
    location: { origin: 'https://mindstream.test' },
  };
  globalThis.location = globalThis.window.location;
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { sendBeacon: () => true },
  });
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  globalThis.localStorage = createStorage({
    'mindstream:threshold': '80',
    'mindstream:interestFilterEnabled': 'true',
    'mindstream:interestFilterThreshold': '65',
    'mindstream.attention.interestVector': JSON.stringify({ dim: 2, vector: [1, 0] }),
    'mindstream.attention.recentSignals': JSON.stringify([]),
  });
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        cursor: null,
        items: [
          {
            annotation: 'A',
            embeddings: { overview: [1, 0] },
            id: 101,
            overview: 'A+',
            publishedAt: '2026-06-20T00:00:00.000Z',
            sourceCode: 'src',
            title: 'Top item',
            url: 'https://example.com/top',
          },
          {
            annotation: 'B',
            embeddings: { overview: [0, 1] },
            id: 102,
            overview: 'B+',
            publishedAt: '2026-06-20T00:00:00.000Z',
            sourceCode: 'src',
            title: 'Lower item',
            url: 'https://example.com/lower',
          },
        ],
        sources: [],
      };
    },
  });
  globalThis.IntersectionObserver = class {
    disconnect() {}
    observe() {}
  };

  const url = pathToFileURL(modulePath);
  url.searchParams.set('t', `${Date.now()}-${Math.random()}`);
  await import(url.href);

  const feed = document.createElement('mindstream-feed');
  feed.connectedCallback();
  feed._identityMenu.connectedCallback();
  await waitFor(() => collectByClass(feed, 'feed-card').length === 2);

  const sliders = collectByClass(feed, 'identity-menu__threshold-slider');
  const toggles = collectByClass(feed, 'identity-menu__filter-toggle');
  const cards = collectByClass(feed, 'feed-card');

  assert.equal(sliders.length, 1);
  assert.equal(toggles.length, 1);
  assert.equal(collectByClass(feed, 'interest-marker--top').length, 1);
  assert.equal(cards[0].hidden, false);
  assert.equal(cards[1].hidden, true);

  sliders[0].value = '0';
  sliders[0].dispatchEvent({ type: 'input' });
  assert.equal(collectByClass(feed, 'interest-marker--top').length, 2);
  assert.equal(cards[0].hidden, false);
  assert.equal(cards[1].hidden, false);
  assert.equal(localStorage.getItem('mindstream:threshold'), '0');
  assert.equal(localStorage.getItem('mindstream:interestFilterThreshold'), null);

  sliders[0].value = '80';
  sliders[0].dispatchEvent({ type: 'input' });
  assert.equal(cards[0].hidden, false);
  assert.equal(cards[1].hidden, true);

  const checkbox = toggles[0].children[0];
  checkbox.checked = false;
  checkbox.dispatchEvent({ type: 'change' });

  assert.equal(collectByClass(feed, 'interest-marker--top').length, 1);
  assert.equal(cards[0].hidden, false);
  assert.equal(cards[1].hidden, false);
  assert.equal(localStorage.getItem('mindstream:interestFilterEnabled'), 'false');

  checkbox.checked = true;
  checkbox.dispatchEvent({ type: 'change' });

  assert.equal(collectByClass(feed, 'interest-marker--top').length, 1);
  assert.equal(cards[0].hidden, false);
  assert.equal(cards[1].hidden, true);
  assert.equal(localStorage.getItem('mindstream:interestFilterEnabled'), 'true');
});

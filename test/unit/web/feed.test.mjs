import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const modulePath = path.resolve('web/ui/js/feed.mjs');

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

  toggle(token, force) {
    if (force === true) {
      this.tokens.add(token);
      this._syncToOwner();
      return true;
    }
    if (force === false) {
      this.tokens.delete(token);
      this._syncToOwner();
      return false;
    }
    if (this.tokens.has(token)) {
      this.tokens.delete(token);
      this._syncToOwner();
      return false;
    }
    this.tokens.add(token);
    this._syncToOwner();
    return true;
  }

  contains(token) {
    return this.tokens.has(token);
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
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.type = '';
    this.open = false;
    this._textContent = '';
    this._className = '';
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

  append(...nodes) {
    for (const node of nodes) {
      this.appendChild(node);
    }
  }

  appendChild(node) {
    if (node instanceof FakeFragment) {
      for (const child of [...node.children]) {
        this.appendChild(child);
      }
      return node;
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  insertBefore(node, referenceNode) {
    if (node instanceof FakeFragment) {
      for (const child of [...node.children]) {
        this.insertBefore(child, referenceNode);
      }
      return node;
    }
    const index = this.children.indexOf(referenceNode);
    const targetIndex = index >= 0 ? index : this.children.length;
    node.parentNode = this;
    this.children.splice(targetIndex, 0, node);
    return node;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  addEventListener(type, handler) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type).push(handler);
  }

  dispatchEvent(event) {
    const handlers = this.eventListeners.get(event.type) || [];
    for (const handler of handlers) {
      handler(event);
    }
    return true;
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this });
  }

  contains(node) {
    if (node === this) return true;
    return this.children.some((child) => child.contains?.(node));
  }
}

class FakeFragment extends FakeNode {}

class FakeDocument {
  constructor(feedRoot) {
    this.feedRoot = feedRoot;
  }

  getElementById(id) {
    return id === 'feed' ? this.feedRoot : null;
  }

  createElement(tagName) {
    return new FakeNode(tagName);
  }

  createDocumentFragment() {
    return new FakeFragment('#fragment');
  }

  addEventListener() {}
}

const createStorage = (seed = {}) => {
  const data = new Map(Object.entries(seed).map(([key, value]) => [key, String(value)]));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
  };
};

const collectByClass = (node, className, result = []) => {
  if (node.classList?.contains(className)) {
    result.push(node);
  }
  for (const child of node.children || []) {
    collectByClass(child, className, result);
  }
  return result;
};

const loadModule = async () => {
  const url = pathToFileURL(modulePath);
  url.searchParams.set('t', `${Date.now()}-${Math.random()}`);
  return import(url.href);
};

test('feed applies stored manual threshold immediately after items are appended', async () => {
  const feedRoot = new FakeNode('div');
  const document = new FakeDocument(feedRoot);
  const observers = [];

  Object.defineProperty(globalThis, 'document', { value: document, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'window', {
    value: {
      location: { origin: 'https://mindstream.test' },
      confirm: () => true,
    },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, 'location', {
    value: globalThis.window.location,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: { sendBeacon: () => true },
    configurable: true,
  });
  globalThis.localStorage = createStorage({
    'mindstream:threshold': '80',
    'mindstream.attention.interestVector': JSON.stringify({ dim: 2, vector: [1, 0] }),
    'mindstream.attention.recentSignals': JSON.stringify([]),
  });
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        sources: [],
        items: [
          {
            id: 101,
            sourceCode: 'src',
            title: 'Top item',
            url: 'https://example.com/top',
            annotation: 'A',
            overview: 'A+',
            publishedAt: '2026-06-20T00:00:00.000Z',
            embeddings: { overview: [1, 0] },
          },
          {
            id: 102,
            sourceCode: 'src',
            title: 'Lower item',
            url: 'https://example.com/lower',
            annotation: 'B',
            overview: 'B+',
            publishedAt: '2026-06-20T00:00:00.000Z',
            embeddings: { overview: [0, 1] },
          },
        ],
        cursor: null,
      };
    },
  });
  globalThis.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }

    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};

  await loadModule();
  await Promise.resolve();

  const topMarkers = collectByClass(feedRoot, 'interest-marker--top');
  const allMarkers = collectByClass(feedRoot, 'interest-marker');
  const slider = collectByClass(feedRoot, 'identity-menu__threshold-slider')[0];

  assert.equal(observers.length >= 2, true);
  assert.equal(allMarkers.length, 2);
  assert.equal(topMarkers.length, 1);
  assert.equal(slider.disabled, false);
});

test('feed threshold arrows adjust manual threshold by one percent', async () => {
  const feedRoot = new FakeNode('div');
  const document = new FakeDocument(feedRoot);

  Object.defineProperty(globalThis, 'document', { value: document, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'window', {
    value: {
      location: { origin: 'https://mindstream.test' },
      confirm: () => true,
    },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, 'location', {
    value: globalThis.window.location,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: { sendBeacon: () => true },
    configurable: true,
  });
  const storage = createStorage({
    'mindstream:threshold': '80',
    'mindstream.attention.interestVector': JSON.stringify({ dim: 2, vector: [1, 0] }),
    'mindstream.attention.recentSignals': JSON.stringify([]),
  });
  globalThis.localStorage = storage;
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        sources: [],
        items: [
          {
            id: 101,
            sourceCode: 'src',
            title: 'Top item',
            url: 'https://example.com/top',
            annotation: 'A',
            overview: 'A+',
            publishedAt: '2026-06-20T00:00:00.000Z',
            embeddings: { overview: [1, 0] },
          },
          {
            id: 102,
            sourceCode: 'src',
            title: 'Lower item',
            url: 'https://example.com/lower',
            annotation: 'B',
            overview: 'B+',
            publishedAt: '2026-06-20T00:00:00.000Z',
            embeddings: { overview: [0, 1] },
          },
        ],
        cursor: null,
      };
    },
  });
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};

  await loadModule();
  await Promise.resolve();

  const slider = collectByClass(feedRoot, 'identity-menu__threshold-slider')[0];
  const value = collectByClass(feedRoot, 'identity-menu__threshold-value')[0];
  const [decrementButton, incrementButton] = collectByClass(feedRoot, 'identity-menu__threshold-step');

  incrementButton.click();
  assert.equal(slider.value, '81');
  assert.equal(value.textContent, '81%');
  assert.equal(storage.getItem('mindstream:threshold'), '81');

  decrementButton.click();
  assert.equal(slider.value, '80');
  assert.equal(value.textContent, '80%');
  assert.equal(storage.getItem('mindstream:threshold'), '80');

  slider.value = '100';
  slider.dispatchEvent({ type: 'input', target: slider });
  assert.equal(incrementButton.disabled, true);

  slider.value = '0';
  slider.dispatchEvent({ type: 'input', target: slider });
  assert.equal(decrementButton.disabled, true);
});

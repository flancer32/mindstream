import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const buildLogger = function () {
  return {
    info() {},
    debug() {},
    warn() {},
    error() {},
    exception() {},
  };
};

const createKnexStub = function () {
  const inserted = [];
  const builder = {
    insert(payload) {
      inserted.push(payload);
      return this;
    },
    onConflict() {
      return this;
    },
    async ignore() {
      return undefined;
    },
  };

  const knex = function (table) {
    if (table !== 'anonymous_identities') {
      throw new Error(`Unexpected table "${table}".`);
    }
    return builder;
  };

  return { knex, inserted };
};

const createRespondStub = function () {
  return {
    isWritable(res) {
      return !(res?.headersSent || res?.writableEnded);
    },
    code204_NoContent({ res }) {
      if (!this.isWritable(res)) return false;
      res.writeHead(204);
      res.end();
      return true;
    },
  };
};

const createRequest = function ({ url = '/api/identity', body, method = 'POST' } = {}) {
  const req = new EventEmitter();
  req.url = url;
  req.method = method;

  process.nextTick(() => {
    if (body !== undefined) {
      req.emit('data', body);
    }
    req.emit('end');
  });

  return req;
};

const createResponse = function ({ writable = true } = {}) {
  return {
    headersSent: !writable,
    writableEnded: !writable,
    status: null,
    writeHead(code) {
      this.status = code;
      this.headersSent = true;
    },
    end() {
      this.writableEnded = true;
    },
  };
};

const buildPayload = function ({ identity = '550e8400-e29b-41d4-a716-446655440000' } = {}) {
  return { identity };
};

const getHandler = async function () {
  const container = await createTestContainer();
  const { knex, inserted } = createKnexStub();

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Fl32_Web_Back_Helper_Respond$', createRespondStub());

  const handler = await container.get('Mindstream_Back_Web_Api_Identity$');
  return { handler, inserted };
};

test('Mindstream_Back_Web_Api_Identity stores valid identity and returns 204', async () => {
  const payload = buildPayload();
  const { handler, inserted } = await getHandler();

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 204);
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].identity_uuid, payload.identity);
});

test('Mindstream_Back_Web_Api_Identity ignores invalid json and returns 204', async () => {
  const { handler, inserted } = await getHandler();

  const req = createRequest({ body: '{invalid' });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 204);
  assert.equal(inserted.length, 0);
});

test('Mindstream_Back_Web_Api_Identity ignores invalid uuid and returns 204', async () => {
  const payload = buildPayload({ identity: 'not-a-uuid' });
  const { handler, inserted } = await getHandler();

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 204);
  assert.equal(inserted.length, 0);
});

test('Mindstream_Back_Web_Api_Identity handles beacon-style request without writable response', async () => {
  const payload = buildPayload();
  const { handler, inserted } = await getHandler();

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse({ writable: false });
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(inserted.length, 1);
});

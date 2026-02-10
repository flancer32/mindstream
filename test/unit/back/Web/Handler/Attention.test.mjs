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

const createKnexStub = function ({ identities = [], publications = [] } = {}) {
  const identityMap = new Map();
  identities.forEach((uuid, index) => {
    identityMap.set(uuid, index + 1);
  });
  const publicationSet = new Set(publications);
  const inserted = [];

  const createIdentityBuilder = function () {
    let identityUuid;
    return {
      select() {
        return this;
      },
      where(filter) {
        identityUuid = filter?.identity_uuid;
        return this;
      },
      async first() {
        if (!identityMap.has(identityUuid)) return undefined;
        return { id: identityMap.get(identityUuid) };
      },
    };
  };

  const createPublicationBuilder = function () {
    let publicationId;
    return {
      select() {
        return this;
      },
      where(filter) {
        publicationId = filter?.id;
        return this;
      },
      async first() {
        return publicationSet.has(publicationId) ? { id: publicationId } : undefined;
      },
    };
  };

  const createAttentionBuilder = function () {
    return {
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
  };

  const knex = function (table) {
    if (table === 'anonymous_identities') return createIdentityBuilder();
    if (table === 'publications') return createPublicationBuilder();
    if (table === 'attention_states') return createAttentionBuilder();
    throw new Error(`Unexpected table "${table}".`);
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
    code400_BadRequest({ res }) {
      if (!this.isWritable(res)) return false;
      res.writeHead(400);
      res.end();
      return true;
    },
    code500_InternalServerError({ res }) {
      if (!this.isWritable(res)) return false;
      res.writeHead(500);
      res.end();
      return true;
    },
  };
};

const createRequest = function ({ url = '/api/attention', body, method = 'POST' } = {}) {
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

const buildPayload = function ({
  identity = '550e8400-e29b-41d4-a716-446655440000',
  publicationId = '1',
  attentionType = 'overview_view',
  timestamp = '2026-02-10T10:00:00Z',
} = {}) {
  return {
    identity,
    publication_id: publicationId,
    attention_type: attentionType,
    timestamp,
  };
};

const getHandler = async function ({ identities = [], publications = [] } = {}) {
  const container = await createTestContainer();
  const { knex, inserted } = createKnexStub({ identities, publications });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Fl32_Web_Back_Helper_Respond$', createRespondStub());

  const handler = await container.get('Mindstream_Back_Web_Api_Attention$');
  return { handler, inserted };
};

test('Mindstream_Back_Web_Api_Attention accepts valid payload and returns 204', async () => {
  const payload = buildPayload();
  const { handler, inserted } = await getHandler({
    identities: [payload.identity],
    publications: [1],
  });

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 204);
  assert.equal(inserted.length, 1);
});

test('Mindstream_Back_Web_Api_Attention returns 400 for missing field', async () => {
  const payload = buildPayload();
  delete payload.identity;

  const { handler } = await getHandler({
    identities: ['550e8400-e29b-41d4-a716-446655440000'],
    publications: [1],
  });

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 400);
});

test('Mindstream_Back_Web_Api_Attention returns 400 for invalid UUID', async () => {
  const payload = buildPayload({ identity: 'not-a-uuid' });
  const { handler } = await getHandler({
    identities: ['not-a-uuid'],
    publications: [1],
  });

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 400);
});

test('Mindstream_Back_Web_Api_Attention returns 422 for missing publication', async () => {
  const payload = buildPayload();
  const { handler } = await getHandler({
    identities: [payload.identity],
    publications: [],
  });

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 422);
});

test('Mindstream_Back_Web_Api_Attention accepts duplicate events', async () => {
  const payload = buildPayload();
  const { handler } = await getHandler({
    identities: [payload.identity],
    publications: [1],
  });

  const resFirst = createResponse();
  const resSecond = createResponse();

  const first = await handler.handle({
    req: createRequest({ body: JSON.stringify(payload) }),
    res: resFirst,
  });
  const second = await handler.handle({
    req: createRequest({ body: JSON.stringify(payload) }),
    res: resSecond,
  });

  assert.equal(first, true);
  assert.equal(second, true);
  assert.equal(resFirst.status, 204);
  assert.equal(resSecond.status, 204);
});

test('Mindstream_Back_Web_Api_Attention processes beacon-style request without writable response', async () => {
  const payload = buildPayload();
  const { handler, inserted } = await getHandler({
    identities: [payload.identity],
    publications: [1],
  });

  const req = createRequest({ body: JSON.stringify(payload) });
  const res = createResponse({ writable: false });
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(inserted.length, 1);
});

test('Mindstream_Back_Web_Api_Attention returns 400 for invalid JSON', async () => {
  const { handler } = await getHandler({
    identities: [],
    publications: [],
  });

  const req = createRequest({ body: '{invalid' });
  const res = createResponse();
  const result = await handler.handle({ req, res });

  assert.equal(result, true);
  assert.equal(res.status, 400);
});

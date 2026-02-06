import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../../di-node.mjs';

const buildResponder = function () {
  const calls = [];
  return {
    calls,
    code200_Ok({ res, headers, body }) {
      calls.push({ res, headers, body });
      if (res?.writeHead) {
        res.writeHead(200, headers);
      }
      if (res?.end) {
        res.end(typeof body === 'string' ? body : JSON.stringify(body));
      }
    },
  };
};

const buildResponse = function () {
  const res = {
    status: null,
    headers: null,
    payload: null,
    headersSent: false,
    writableEnded: false,
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(payload) {
      this.payload = payload;
      this.headersSent = true;
      this.writableEnded = true;
    },
  };
  return res;
};

test('Mindstream_Back_Web_Api_Handler_Fallback responds with ok json', async () => {
  const container = await createTestContainer();
  const responder = buildResponder();
  const res = buildResponse();

  container.register('Fl32_Web_Back_Helper_Respond$', responder);

  const fallback = await container.get('Mindstream_Back_Web_Api_Handler_Fallback$');
  await fallback.handle({ res, path: '/unknown' });

  assert.equal(res.status, 200);
  assert.equal(res.headers['content-type'], 'application/json');
  assert.ok(res.payload);
  const payload = JSON.parse(res.payload);
  assert.deepEqual(payload, {
    status: 'ok',
    message: 'api is alive',
    path: '/unknown',
  });
  assert.equal(responder.calls.length, 1);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-node.mjs';

function createConsoleMock() {
  const calls = [];
  const capture = (level) => (payload) => {
    calls.push({ level, payload });
  };
  return {
    calls,
    console: {
      debug: capture('debug'),
      info: capture('info'),
      warn: capture('warn'),
      error: capture('error'),
    },
  };
}

test('Mindstream_Shared_Logger exposes required methods', async () => {
  const container = await createTestContainer();
  const logger = await container.get('Mindstream_Shared_Logger$');

  assert.equal(typeof logger.debug, 'function');
  assert.equal(typeof logger.info, 'function');
  assert.equal(typeof logger.warn, 'function');
  assert.equal(typeof logger.error, 'function');
  assert.equal(typeof logger.exception, 'function');
});

test('Mindstream_Shared_Logger requires namespace', async () => {
  const container = await createTestContainer();
  const logger = await container.get('Mindstream_Shared_Logger$');

  assert.throws(() => logger.debug(), /Namespace is required/);
  assert.throws(() => logger.exception(), /Namespace is required/);
});

test('Mindstream_Shared_Logger separates error from exception semantics', async () => {
  const container = await createTestContainer();
  const logger = await container.get('Mindstream_Shared_Logger$');

  const err = new Error('boom');
  assert.throws(() => logger.error('ns', err), /Use exception\(\)/);
  assert.throws(() => logger.exception('ns', 'not-error'), /Error instance is required/);
});

test('Mindstream_Shared_Logger logs exception details from Error', async () => {
  const container = await createTestContainer();
  const logger = await container.get('Mindstream_Shared_Logger$');

  const originalConsole = globalThis.console;
  const { calls, console: consoleMock } = createConsoleMock();
  globalThis.console = consoleMock;

  try {
    const err = new Error('failure', { cause: { code: 'E_TEST' } });
    logger.exception('Mindstream.Shared', err, { extra: true });

    assert.equal(calls.length, 1);
    const entry = calls[0].payload;
    assert.equal(entry.level, 'exception');
    assert.equal(entry.namespace, 'Mindstream.Shared');
    assert.equal(entry.message, 'failure');
    assert.equal(entry.errorMessage, 'failure');
    assert.ok(entry.errorStack);
    assert.deepEqual(entry.errorCause, { code: 'E_TEST' });
    assert.deepEqual(entry.args, [{ extra: true }]);
    assert.equal(typeof entry.timestamp, 'string');
  } finally {
    globalThis.console = originalConsole;
  }
});

test('Mindstream_Shared_Logger does not keep namespace state', async () => {
  const container = await createTestContainer();
  const logger = await container.get('Mindstream_Shared_Logger$');

  const originalConsole = globalThis.console;
  const { calls, console: consoleMock } = createConsoleMock();
  globalThis.console = consoleMock;

  try {
    logger.info('ns.one', 'first');
    logger.info('ns.two', 'second');

    assert.equal(calls.length, 2);
    assert.equal(calls[0].payload.namespace, 'ns.one');
    assert.equal(calls[1].payload.namespace, 'ns.two');
  } finally {
    globalThis.console = originalConsole;
  }
});

test('Mindstream_Shared_Logger can be mocked in tests', async () => {
  const container = await createTestContainer();
  const stub = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    exception: () => {},
  };

  container.register('Mindstream_Shared_Logger$', stub);

  const logger = await container.get('Mindstream_Shared_Logger$');
  assert.equal(logger, stub);
});

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

const binPath = path.join(projectRoot, 'bin', 'app.mjs');

test('bin/app.mjs runs without error', async () => {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [binPath], {
      env: {
        ...process.env,
        MINDSTREAM_MODE: 'test'
      },
      stdio: 'ignore'
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      try {
        assert.equal(code, 0);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
});

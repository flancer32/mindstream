import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

const indexPath = path.join(projectRoot, 'web', 'index.html');
const swPath = path.join(projectRoot, 'web', 'sw.js');

test('index.html exists and looks like valid HTML', async () => {
  const content = await fs.readFile(indexPath, 'utf8');
  const normalized = content.toLowerCase();

  assert.ok(normalized.startsWith('<!doctype html>'));
  assert.ok(normalized.includes('<html'));
  assert.ok(normalized.includes('<head'));
  assert.ok(normalized.includes('<body'));
  assert.ok(normalized.includes('</html>'));
});

test('sw.js exists and includes minimal service worker hooks', async () => {
  const content = await fs.readFile(swPath, 'utf8');

  assert.ok(content.includes('self.addEventListener'));
  assert.ok(content.includes('install'));
  assert.ok(content.includes('activate'));
});

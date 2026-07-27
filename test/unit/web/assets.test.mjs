import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

const indexPath = path.join(projectRoot, 'web', 'index.html');
const feedCssPath = path.join(projectRoot, 'web', 'ui', 'css', 'feed.css');

test('index.html exists and looks like valid HTML', async () => {
  const content = await fs.readFile(indexPath, 'utf8');
  const normalized = content.toLowerCase();

  assert.ok(normalized.startsWith('<!doctype html>'));
  assert.ok(normalized.includes('<html'));
  assert.ok(normalized.includes('<head'));
  assert.ok(normalized.includes('<body'));
  assert.ok(normalized.includes('</html>'));
});

test('hidden feed cards override the card display mode', async () => {
  const content = await fs.readFile(feedCssPath, 'utf8');

  assert.match(
    content,
    /\.feed-card\[hidden\]\s*\{[^}]*display:\s*none\s*;/u
  );
});

test('identity menu includes a bilingual about dialog', async () => {
  const source = path.join(projectRoot, 'web', 'app', 'Web', 'Component', 'IdentityMenu.mjs');
  const content = await fs.readFile(source, 'utf8');

  assert.match(content, /About Mindstream/u);
  assert.match(content, /О проекте Mindstream/u);
  assert.match(content, /identity-menu__about-panel/u);
  assert.match(content, /https:\/\/habr\.com\/ru\/articles\/983094\//u);
  assert.match(content, /https:\/\/wiredgeese\.com\/en\/contact\.html/u);
});

test('identity menu shows a short identity and can copy its full value', async () => {
  const source = path.join(projectRoot, 'web', 'app', 'Web', 'Component', 'IdentityMenu.mjs');
  const content = await fs.readFile(source, 'utf8');

  assert.match(content, /currentIdentity\.split\('-'\)\[0\]\}-\.\.\./u);
  assert.match(content, /clipboard\?\.writeText\(currentIdentity\)/u);
});

test('identity menu styles it as a fixed floating control', async () => {
  const content = await fs.readFile(feedCssPath, 'utf8');

  assert.match(content, /\.identity-menu\s*\{[^}]*position:\s*fixed\s*;/u);
  assert.match(content, /\.identity-menu__panel\s*\{[^}]*position:\s*fixed\s*;/u);
  assert.match(content, /\.identity-menu--filter-enabled \.identity-menu__toggle/u);
});

test('about dialog uses a compact mobile header layout', async () => {
  const content = await fs.readFile(feedCssPath, 'utf8');

  assert.match(content, /@media \(max-width: 480px\)[\s\S]*\.identity-menu__about-title\s*\{[^}]*flex:\s*0 0 100%/u);
});

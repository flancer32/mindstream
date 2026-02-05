import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Ingest_Rss_Parser parses RSS items', async () => {
  const container = await createTestContainer();
  const parser = await container.get('Mindstream_Back_Ingest_Rss_Parser$');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss>
      <channel>
        <item>
          <title><![CDATA[Test Title]]></title>
          <link>https://example.com/post/1</link>
          <guid>abc-1</guid>
          <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
        </item>
        <item>
          <title>Second &amp; Title</title>
          <link>https://example.com/post/2</link>
          <guid>abc-2</guid>
          <pubDate>Tue, 02 Jan 2024 10:00:00 GMT</pubDate>
        </item>
      </channel>
    </rss>`;

  const items = parser.parseItems(xml);

  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'Test Title');
  assert.equal(items[0].link, 'https://example.com/post/1');
  assert.equal(items[0].guid, 'abc-1');
  assert.equal(items[1].title, 'Second & Title');
});

test('Mindstream_Back_Ingest_Rss_Parser returns empty array for empty input', async () => {
  const container = await createTestContainer();
  const parser = await container.get('Mindstream_Back_Ingest_Rss_Parser$');
  assert.deepEqual(parser.parseItems(''), []);
});

/**
 * @module Mindstream_Back_Ingest_Extract_Habr_Parser
 * @description Extracts markdown from Habr publication HTML.
 */
export default class Mindstream_Back_Ingest_Extract_Habr_Parser {
  constructor({}) {
    const CONTAINER_PATTERNS = [
      /<div[^>]*class="[^"]*tm-article-body[^"]*"[^>]*>/i,
      /<div[^>]*class="[^"]*article-formatted-body[^"]*"[^>]*>/i,
      /<div[^>]*class="[^"]*tm-article-presenter__body[^"]*"[^>]*>/i,
    ];

    const buildError = function (message) {
      const err = new Error(message);
      err.isExtractionError = true;
      return err;
    };

    const decodeEntities = function (value) {
      if (!value) return '';
      return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");
    };

    const stripTags = function (value) {
      return String(value ?? '').replace(/<[^>]+>/g, '');
    };

    const extractContainer = function (html) {
      for (const pattern of CONTAINER_PATTERNS) {
        const match = pattern.exec(html);
        if (!match) continue;
        const startIndex = match.index;
        const tagStart = html.lastIndexOf('<', startIndex);
        const tagNameMatch = /<\s*([a-z0-9]+)/i.exec(html.slice(tagStart, tagStart + 20));
        const tagName = tagNameMatch?.[1];
        if (!tagName) continue;

        const openTagEnd = html.indexOf('>', startIndex);
        if (openTagEnd === -1) continue;

        const tagRe = new RegExp(`</?${tagName}\\b`, 'gi');
        tagRe.lastIndex = startIndex;
        let depth = 0;
        let endIndex = -1;
        let matchTag = tagRe.exec(html);
        while (matchTag) {
          const token = matchTag[0];
          if (token.startsWith('</')) {
            depth -= 1;
          } else {
            depth += 1;
          }
          if (depth === 0) {
            endIndex = matchTag.index;
            break;
          }
          matchTag = tagRe.exec(html);
        }

        if (endIndex === -1) continue;
        return html.slice(openTagEnd + 1, endIndex);
      }
      return null;
    };

    const normalizeMarkdown = function (text) {
      return text
        .replace(/\r/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
    };

    this.extractMarkdown = function (html) {
      if (!html || typeof html !== 'string') {
        throw buildError('HTML payload must be a string.');
      }

      const container = extractContainer(html);
      if (!container) {
        throw buildError('Habr article container not found.');
      }

      const codeBlocks = [];
      let working = container.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
        const withoutPre = match.replace(/<\/?pre[^>]*>/gi, '');
        const withoutCode = withoutPre.replace(/<\/?code[^>]*>/gi, '');
        const content = decodeEntities(stripTags(withoutCode)).trimEnd();
        const index = codeBlocks.push(content) - 1;
        return `@@CODEBLOCK_${index}@@`;
      });

      working = working.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => {
        const text = decodeEntities(stripTags(code)).trim();
        if (!text) return '';
        return `\`${text}\``;
      });

      working = working.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => {
        const text = decodeEntities(stripTags(content)).trim();
        if (!text) return '';
        return `\n${'#'.repeat(Number(level))} ${text}\n`;
      });

      working = working.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
        const text = decodeEntities(stripTags(content)).trim();
        if (!text) return '';
        const lines = text.split(/\n+/).map((line) => `> ${line}`);
        return `\n${lines.join('\n')}\n`;
      });

      working = working.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => {
        const text = decodeEntities(stripTags(content)).trim();
        if (!text) return '';
        return `\n- ${text}`;
      });

      working = working.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => {
        const text = decodeEntities(stripTags(content)).trim();
        if (!text) return '';
        return `\n\n${text}\n\n`;
      });

      working = working.replace(/<br\s*\/?>/gi, '\n');
      working = stripTags(working);
      working = decodeEntities(working);

      let markdown = working.replace(/@@CODEBLOCK_(\d+)@@/g, (_, index) => {
        const content = codeBlocks[Number(index)] ?? '';
        return `\n\`\`\`\n${content}\n\`\`\`\n`;
      });

      markdown = normalizeMarkdown(markdown);
      if (!markdown) {
        throw buildError('Extracted markdown is empty.');
      }
      return markdown;
    };
  }
}

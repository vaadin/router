import { extname } from 'node:path';
import hljs from 'highlight.js/lib/core';
import cssLang from 'highlight.js/lib/languages/css';
import typescriptLang from 'highlight.js/lib/languages/typescript';
import xmlLang from 'highlight.js/lib/languages/xml';
import * as prettier from 'prettier';
import type { Plugin } from 'vite';

hljs.registerLanguage('ts', typescriptLang);
hljs.registerLanguage('html', xmlLang);
hljs.registerLanguage('css', cssLang);

const snippetStart = {
  html: '<!-- tag::snippet[] -->',
  ts: '// tag::snippet[]',
  css: '/* tag::snippet[] */',
} as const;

const snippetEnd = {
  html: '<!-- end::snippet[] -->',
  ts: '// end::snippet[]',
  css: '/* end::snippet[] */',
} as const;

function extractSnippet(code: string, language: keyof typeof snippetStart) {
  let firstIndex = code.indexOf(snippetStart[language]);
  let lastIndex = code.indexOf(snippetEnd[language]);

  firstIndex = firstIndex === -1 ? 0 : firstIndex + snippetStart[language].length;
  lastIndex = lastIndex === -1 ? code.length : lastIndex;

  return code.substring(firstIndex, lastIndex).trim();
}

function transformCode(code: string, language: keyof typeof snippetStart) {
  return hljs.highlight(extractSnippet(code, language), { language }).value;
}

export function codeSnippetPlugin(): Plugin {
  return {
    name: 'code-snippet',
    enforce: 'pre',
    async resolveId(id, importer) {
      if (id.includes('?')) {
        const resolved = await this.resolve(id, importer);

        if (resolved) {
          const search = resolved.id.substring(resolved.id.indexOf('?'));
          const purePath = resolved.id.substring(0, resolved.id.length - search.length);
          const params = new URLSearchParams(search);

          if (params.has('snippet') && purePath.endsWith('.css')) {
            params.append('raw', '');
            return {
              ...resolved,
              id: `${purePath}?${params.toString()}`,
            };
          }

          return resolved;
        }
      }

      return null;
    },
    async transform(code, id) {
      if (id.includes('?')) {
        const search = id.substring(id.indexOf('?'));
        const params = new URLSearchParams(search);

        if (params.has('snippet')) {
          const purePath = id.substring(0, id.length - search.length);
          const lang = extname(purePath).substring(1);
          if (lang === 'ts' || lang === 'html' || lang === 'css') {
            let snippet = extractSnippet(code, lang);
            snippet = await prettier.format(snippet, {
              parser: lang === 'ts' ? 'typescript' : lang,
              singleQuote: true,
              trailingComma: 'all',
            });
            snippet = transformCode(snippet, lang);
            return {
              code: `import { html } from 'lit'; export default html\`${snippet.replaceAll(/(`|\$|\{\})/gu, '\\$1')}\``,
              map: null,
            };
          }
        }
      }

      return null;
    },
  };
}

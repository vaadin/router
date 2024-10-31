import 'regexp.escape/auto';
import { extname } from 'node:path';
import hljs from 'highlight.js/lib/core';
import cssLang from 'highlight.js/lib/languages/css';
import javascriptLang from 'highlight.js/lib/languages/javascript';
import typescriptLang from 'highlight.js/lib/languages/typescript';
import xmlLang from 'highlight.js/lib/languages/xml';
import * as prettier from 'prettier';
import type { Plugin } from 'vite';

hljs.registerLanguage('ts', typescriptLang);
hljs.registerLanguage('js', javascriptLang);
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

function extractSnippets(code: string, language: keyof typeof snippetStart) {
  const result: string[] = [];
  const pattern = new RegExp(
    `${RegExp.escape(snippetStart[language])}([\\s\\S]*?)${RegExp.escape(snippetEnd[language])}`,
    'gmu',
  );

  let match;
  while ((match = pattern.exec(code)) != null) {
    result.push(match[1].trim());
  }

  if (result.length === 0) {
    result.push(code);
  }

  return result;
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
            let snippets = extractSnippets(code, lang);

            snippets = await Promise.all(
              snippets.map(
                async (snippet) =>
                  await prettier.format(snippet, {
                    parser: lang === 'ts' ? 'typescript' : lang,
                    singleQuote: true,
                    trailingComma: 'all',
                  }),
              ),
            );
            snippets = snippets.map((snippet) => hljs.highlight(snippet, { language: lang }).value);
            return {
              code: `import { html } from 'lit'; export default [${snippets
                .map((snippet) => `html\`${snippet.replaceAll(/(`|\$|\{\})/gu, '\\$1')}\``)
                .join(',')}];`,
              map: null,
            };
          }
        }
      }

      return null;
    },
  };
}

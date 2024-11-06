import 'regexp.escape/auto';
import { extname } from 'node:path';
import hljs from 'highlight.js/lib/core';
import cssLang from 'highlight.js/lib/languages/css';
import javascriptLang from 'highlight.js/lib/languages/javascript';
import typescriptLang from 'highlight.js/lib/languages/typescript';
import xmlLang from 'highlight.js/lib/languages/xml';
import * as prettier from 'prettier';
import type { Plugin } from 'vite';

hljs.registerLanguage('javascript', javascriptLang);
hljs.registerLanguage('css', cssLang);
hljs.registerLanguage('typescript', typescriptLang);
hljs.registerLanguage('xml', xmlLang);

const languages = ['typescript', 'html', 'css', 'javascript'];

type SnippetPatternKey = keyof typeof snippetPattern;
const snippetPattern = {
  html: /<!-- tag::snippet\[\] -->([\s\S]*?)<!-- end::snippet\[\] -->/gmu,
  ts: /\/\/ tag::snippet\[\]([\s\S]*?)\/\/ end::snippet\[\]/gmu,
  css: /\/\* tag::snippet\[\] \*\/([\s\S]*?)\/\* end::snippet\[\] \*\//gmu,
} as const;

function extractSnippets(code: string, language: SnippetPatternKey) {
  const result: string[] = [];
  const pattern = snippetPattern[language];

  let match;
  while ((match = pattern.exec(code)) != null) {
    result.push(match[1].trim());
  }

  if (result.length === 0) {
    result.push(code);
  }

  return result;
}

function escapeString(str: string) {
  return str.replaceAll(/(`|\$|\{\})/gu, '\\$1');
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

            snippets = [code, ...snippets];

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

            snippets = snippets.map((snippet) => hljs.highlightAuto(snippet, languages).value);

            return {
              code: `import { html } from 'lit'; export default [\`${escapeString(code)}\`,${snippets
                .map((snippet) => `html\`${escapeString(snippet)}\``)
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

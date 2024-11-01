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

type SnippetPatternKey = keyof typeof snippetPattern;
const snippetPattern = {
  html: /<!-- tag::snippet\[\] -->([\s\S]*?)<!-- end::snippet\[\] -->/gmu,
  ts: /\/\/ tag::snippet\[\]([\s\S]*?)\/\/ end::snippet\[\]/gmu,
  css: /\/\* tag::snippet\[\] \*\/([\s\S]*?)\/\* end::snippet\[\] \*\//gmu,
} as const;

type HtmlLangMixinsKey = keyof typeof htmlLangMixins;
const htmlLangMixins = {
  js: /<script(.*?)>([\s\S]*?)<\/script>/gmu,
  css: /<style(.*?)>([\s\S]*?)<\/style>/gmu,
} as const;

const htmlLangMixinCommenter = {
  js(code: string) {
    return `// ${code}`;
  },
  css(code: string) {
    return `/* ${code} */`;
  },
};

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

class SubSnippetReplacer {
  readonly #lang: HtmlLangMixinsKey;
  readonly #map = new Map<string, string>();

  constructor(lang: HtmlLangMixinsKey) {
    this.#lang = lang;
  }

  replace(code: string) {
    const pattern = htmlLangMixins[this.#lang];

    return code.replace(pattern, (_, attrs, script) => {
      const id = crypto.randomUUID();

      this.#map.set(id, hljs.highlight(script, { language: this.#lang }).value);
      return `<script${attrs}>${htmlLangMixinCommenter[this.#lang](id)}</script>`;
    });
  }

  restoreAll(code: string) {
    let result = code;

    for (const [id, snippet] of this.#map) {
      result = result.replaceAll(htmlLangMixinCommenter[this.#lang](id), snippet);
    }

    return result;
  }
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
            const jsReplacer = new SubSnippetReplacer('js');
            const cssReplacer = new SubSnippetReplacer('css');

            snippets = snippets.map((snippet) => {
              let result = snippet;

              if (lang === 'html') {
                for (const mixinLang of Object.keys(htmlLangMixins) as readonly HtmlLangMixinsKey[]) {
                  if (mixinLang === 'js') {
                    result = jsReplacer.replace(result);
                  }

                  result = cssReplacer.replace(result);
                }
              }

              result = hljs.highlight(result, { language: lang }).value;
              result = jsReplacer.restoreAll(result);
              result = cssReplacer.restoreAll(result);

              return result;
            });
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

import { readFile } from 'node:fs/promises';
import cssnanoPlugin from 'cssnano';
import postcss from 'postcss';
import type { Plugin } from 'vite';

const cssTransformer = postcss([
  cssnanoPlugin({
    preset: 'default',
  }),
]);

export default function constructCss(): Plugin {
  const styles = new Map();

  return {
    enforce: 'post',
    name: 'vite-construct-css',
    async load(id) {
      if (id.endsWith('.css?ctr')) {
        const content = await readFile(id.substring(0, id.length - 4), 'utf8');
        styles.set(id, content);
        return {
          code: '',
        };
      }

      return undefined;
    },
    async transform(_, id) {
      if (styles.has(id)) {
        const css = styles.get(id);

        const { content } = await cssTransformer.process(css, {
          from: id,
        });

        return {
          code: `const css = new CSSStyleSheet(); css.replaceSync(${JSON.stringify(content)}); export default css;`,
        };
      }

      return undefined;
    },
  };
}

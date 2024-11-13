import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { mergeConfig } from 'vite';
import { codeSnippetPlugin } from '../scripts/codeSnippet.js';
import viteConfig from '../vite.config.js';

const root = new URL('./', import.meta.url);

function convertToId(str: string) {
  return str.replace(/[-/]./gu, (x) => x[1].toUpperCase());
}

const dirs = Object.fromEntries(
  await glob('./**/{index,iframe}.html', { cwd: root }).then((files) =>
    files
      .filter((file) => !file.startsWith('@') && file !== 'index.html')
      .map((name) => [convertToId(dirname(name)), fileURLToPath(new URL(name, root))]),
  ),
);

export default mergeConfig(viteConfig, {
  build: {
    outDir: fileURLToPath(new URL('../.docs', root)),
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', root)),
        ...dirs,
      },
    },
  },
  resolve: {
    alias: {
      '@helpers/': fileURLToPath(new URL('./@helpers/', root)),
      '@vaadin/router': fileURLToPath(new URL('../src/index.js', root)),
    },
  },
  plugins: [codeSnippetPlugin()],
  root: fileURLToPath(root),
});

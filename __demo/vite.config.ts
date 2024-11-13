import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { codeSnippetPlugin } from '../scripts/codeSnippet.js';
import viteConfig from '../vite.config.js';

const root = new URL('./', import.meta.url);

function camelize(str: string) {
  return str.replace(/-./gu, (x) => x[1].toUpperCase());
}

const dirs = Object.fromEntries(
  (await readdir(root, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('@'))
    .map((dirent) => [camelize(dirent.name), fileURLToPath(new URL(`./${dirent.name}/index.html`, root))]),
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

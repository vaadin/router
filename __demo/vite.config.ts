import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { codeSnippetPlugin } from '../scripts/codeSnippet.js';
import viteConfig from '../vite.config.js';

const root = new URL('./', import.meta.url);

export default mergeConfig(viteConfig, {
  resolve: {
    alias: {
      '@helpers/': fileURLToPath(new URL('./helpers/', root)),
    },
  },
  plugins: [codeSnippetPlugin()],
  root: fileURLToPath(root),
});

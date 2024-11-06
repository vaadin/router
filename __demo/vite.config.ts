import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { codeSnippetPlugin } from '../scripts/codeSnippet.js';
import viteConfig from '../vite.config.js';

const root = new URL('./', import.meta.url);

export default mergeConfig(viteConfig, {
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', root)),
        animatedTransitions: fileURLToPath(new URL('./animated-transitions/index.html', root)),
      },
    },
  },
  resolve: {
    alias: {
      '@helpers/': fileURLToPath(new URL('./helpers/', root)),
      '@vaadin/router': fileURLToPath(new URL('../src/index.js', root)),
    },
  },
  plugins: [codeSnippetPlugin()],
  root: fileURLToPath(root),
});

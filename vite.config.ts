import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { PackageJson } from 'type-fest';
import { defineConfig } from 'vite';
import constructCss from './scripts/constructCss.js';
import loadRegisterJs from './scripts/loadRegisterJs';

const root = new URL('./', import.meta.url);
const packageJson: PackageJson = await readFile(new URL('./package.json', root), 'utf8').then(JSON.parse);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '/base': '', // support '/base' prefix for karma
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        importAttributesKey: 'with',
      },
    },
  },
  esbuild: {
    define: {
      __NAME__: `'${packageJson.name ?? '@hilla/unknown'}'`,
      __VERSION__: `'${packageJson.version ?? '0.0.0'}'`,
    },
    supported: {
      decorators: false,
      'import-attributes': true,
      'top-level-await': true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        decorators: false,
        'import-attributes': true,
        'top-level-await': true,
      },
      target: 'esnext',
    },
  },
  plugins: [loadRegisterJs(), constructCss()],
  root: fileURLToPath(root),
});

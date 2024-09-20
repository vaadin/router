import { readFile } from 'node:fs/promises';
import type { PackageJson } from 'type-fest';
import { defineConfig } from 'vite';

const packageJson: PackageJson = await readFile(new URL('./package.json', import.meta.url), 'utf8').then(JSON.parse);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
  },
  esbuild: {
    define: {
      __NAME__: `'${packageJson.name ?? '@hilla/unknown'}'`,
      __VERSION__: `'${packageJson.version ?? '0.0.0'}'`,
    },
  },
  root: process.cwd(),
});

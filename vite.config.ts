import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
  },
  root: resolve(
    process.cwd()
  ),
});

import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { resolveHTMLImports } from '../scripts/resolveHTMLImports.js';
import viteConfig from '../vite.config.js';

const root = new URL('./', import.meta.url);

export default mergeConfig(viteConfig, {
  root: fileURLToPath(root),
});

import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';

const searchParamsPattern = /\?.*$/iu;

export function resolveHTMLImports(): Plugin {
  return {
    enforce: 'pre',
    name: 'resolve-html-imports',
    resolveId(id, importer) {
      const _importer = importer ? pathToFileURL(importer.replace(searchParamsPattern, '')) : null;
      if (
        _importer?.pathname.endsWith('.html') &&
        !_importer.pathname.endsWith('index.html') &&
        !_importer.pathname.includes('node_modules') &&
        id.endsWith('.js')
      ) {
        return fileURLToPath(new URL(id.replace('.js', '.ts'), _importer as URL));
      }
      return null;
    },
  };
}

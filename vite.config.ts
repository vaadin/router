import { readFile } from 'node:fs/promises';
import MagicString from 'magic-string';
import type { PackageJson } from 'type-fest';
import { defineConfig, type Plugin } from 'vite';

const packageJson: PackageJson = await readFile(new URL('./package.json', import.meta.url), 'utf8').then(JSON.parse);

// This plugin adds "__REGISTER__()" function definition everywhere where it finds
// the call for that function. It is necessary for a correct code for tests.
function loadRegisterJs(): Plugin {
  return {
    enforce: 'pre',
    name: 'vite-hilla-register',
    async transform(code) {
      if (code.includes('__REGISTER__()') && !code.includes('function __REGISTER__')) {
        const registerCode = await readFile(new URL('scripts/register.js', import.meta.url), 'utf8').then((c) =>
          c.replace('export', ''),
        );

        const _code: MagicString = new MagicString(code);
        _code.prepend(registerCode);

        return {
          code: _code.toString(),
          map: _code.generateMap(),
        };
      }

      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '/base': '', // support '/base' prefix for karma
    },
  },
  build: {
    target: 'esnext',
  },
  esbuild: {
    define: {
      __NAME__: `'${packageJson.name ?? '@hilla/unknown'}'`,
      __VERSION__: `'${packageJson.version ?? '0.0.0'}'`,
    },
  },
  plugins: [loadRegisterJs()],
  root: import.meta.url,
});

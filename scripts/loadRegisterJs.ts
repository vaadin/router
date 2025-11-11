import { readFile } from 'node:fs/promises';
import MagicString from 'magic-string';
import type { Plugin } from 'vite';

const scripts = new URL('./', import.meta.url);

// This plugin adds "__REGISTER__()" function definition everywhere where it finds
// the call for that function. It is necessary for a correct code for tests.
export default function loadRegisterJs(): Plugin {
  return {
    enforce: 'pre',
    name: 'vite-hilla-register',
    async transform(code) {
      if (code.includes('__REGISTER__()') && !code.includes('function __REGISTER__')) {
        const registerCode = await readFile(new URL('register.js', scripts), 'utf8').then((c) =>
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

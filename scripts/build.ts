import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { glob } from 'glob';
import type { PackageJson } from 'type-fest';

const scriptsDir = new URL('./', import.meta.url);
const root = new URL('../', import.meta.url);

const [packageJson, entryPoints] = await Promise.all([
  readFile(new URL('package.json', root), 'utf8').then(JSON.parse) as Promise<PackageJson>,
  glob('src/**/*.{ts,tsx}', { ignore: ['**/*.t.ts'] }),
]);

await build({
  define: {
    __NAME__: `'${packageJson.name ?? '@hilla/unknown'}'`,
    __VERSION__: `'${packageJson.version ?? '0.0.0'}'`,
  },
  entryPoints,
  format: 'esm',
  // Adds a __REGISTER__ function definition everywhere in the built code where
  // the call for that function exists.
  inject: [fileURLToPath(new URL('./register.js', scriptsDir))],
  outdir: 'dist',
  sourcemap: 'linked',
  sourcesContent: true,
  tsconfig: fileURLToPath(new URL('./tsconfig.build.json', root)),
});

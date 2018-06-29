import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const plugins = [
  // The 'node-resolve' plugin allows Rollup to resolve bare module imports like
  // in `import pathToRegexp from 'path-to-regexp'`
  resolve(),

  // The 'commonjs' plugin allows Rollup to convert CommonJS exports on the fly
  // into ES module imports (so that `import pathToRegexp from 'path-to-regexp'`
  // works even though the exports are done via `module.exports = {}`)
  commonjs(),
];

const config = [
  // ES module bundle, not transpiled (for the browsers that support ES modules)
  // ---
  // This is a tradeoff between ease of use (always easier) and size-efficiency
  // (in some cases less efficient).
  //
  // The 'path-to-regexp' dependency is not compatible with the ES module
  // imports and needs to be converted into an ES module for the @vaadin/router
  // module to be usable 'as is'. Bundling the path-to-regexp dependency in at
  // this point removes the need to do it later, so the @vaadin/router module
  // can be imported 'as is'.
  //
  // The size inefficiency appears if the app that uses @vaadin/router also has
  // a direct (or transitive) dependency to 'path-to-regexp'. In that case,
  // there will be two copies of the path-to-regexp code in the final bundle.
  // That does not lead to any naming conflicts, only to that 2.5kB of minified
  // code is duplicated.
  {
    input: 'index.js',
    output: {
      format: 'es',
      file: pkg.main,
      sourcemap: true,
    },
    plugins
  },

  // UMD bundle, transpiled (for the browsers that do not support ES modules).
  // Also works in Node.
  {
    input: 'index.js',
    output: {
      format: 'umd',
      file: pkg.main.replace('.js', '.umd.js'),
      sourcemap: true,
      name: 'Vaadin',
      extend: true,
    },
    plugins: [
      ...plugins,
      babel({
        // The 'external-helpers' Babel plugin allows Rollup to include every
        // used babel helper just once per bundle, rather than including them in
        // every module that uses them (which is the default behaviour).
        plugins: ['external-helpers'],
        presets: [
          ['env', {
            // Run `npm run browserslist` to see the percent of users covered
            // by this browsers selection
            targets: {
              browsers: pkg.browserslist
            },

            // Instructs Babel to not convert ES modules to CommonJS--that's a
            // job for Rollup.
            modules: false,

            // To see which browsers are targeted, and which JS features are
            // polyfilled, uncomment the next line and run `npm run build`
            // debug: true,
          }]
        ],
      })]
  },
];

const sourceFiles = new Map([
  ['src/resolver/path-to-regexp.js', 'pathToRegexp'],
  ['src/resolver/matchPath.js', 'matchPath'],
  ['src/resolver/matchRoute.js', 'matchRoute'],
  ['src/resolver/resolver.js', 'Resolver'],
  ['src/resolver/generateUrls.js', 'generateUrls'],
  ['src/triggers/click.js', 'CLICK'],
  ['src/triggers/popstate.js', 'POPSTATE'],
  ['src/triggers/setNavigationTriggers.js', 'setNavigationTriggers'],
  ['src/transitions/animate.js', 'animate'],
]);
const coverageBundles = Array.from(sourceFiles.entries()).map(([file, name]) => {
  return {
    input: file,
    external: (id, parent, isResolved) => {
      return !!parent && sourceFiles.has(
        path.relative(__dirname, path.resolve(path.dirname(parent), id)));
    },
    output: {
      format: 'iife',
      file: file.replace('src', 'dist/test-iife'),
      banner: '/* This file is automatically generated by `npm run build` */',
      name: `VaadinTestNamespace.${name}`,
      globals: (id) => {
        const name = sourceFiles.get(path.relative(__dirname, id));
        return name ? `VaadinTestNamespace.${name}` : id;
      },
    },
    plugins,
  };
});

// IIFE bundles for individual source files (for coverage testing)
config.push(...coverageBundles);

export default config;

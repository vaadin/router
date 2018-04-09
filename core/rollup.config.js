import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const plugins = [
  resolve(), // so Rollup can find NPM modules
  commonjs({ // so Rollup can convert `path-to-regexp` to an ES module
    include: 'node_modules/**'
  })
];

export default [
  // browser-friendly UMD build with all dependencies bundled-in
  {
    input: 'index.js',
    output: {
      name: 'Vaadin.Router',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: plugins
  },

  // ES module build with all dependencies bundled-in
  // This is a tradeoff between ease of use (always) and size-efficiency (in some
  // cases): Some of the deps (path-to-regexp) are not compatible with the ES module
  // imports and need to be converted into ES modules for this module to be usable.
  // Bundling them in at this point removes the need to do it later, so this module
  // can be imported as is. The size inefficiency could be an issue if some other
  // part of the app also has a dependency on path-to-regexp. In that case, it would
  // need to include its own copy of the dep (no deduplication).
  {
    input: 'index.js',
    output: [
      {file: pkg.module, format: 'es'}
    ],
    plugins: plugins
  },

  // CommonJS (for Node) build
  {
    input: 'index.js',
    external: ['universal-router'],
    output: [
      {file: pkg.main, format: 'cjs'},
    ],
    plugins: [
      resolve(), // so Rollup can find NPM modules
    ]
  }
];
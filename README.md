[![NPM version](https://img.shields.io/npm/v/@vaadin/router.svg)](https://www.npmjs.com/package/@vaadin/router)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@vaadin/router.svg)](https://bundlephobia.com/result?p=@vaadin/router)
[![Build Status](https://travis-ci.org/vaadin/vaadin-router.svg?branch=master)](https://travis-ci.org/vaadin/vaadin-router)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/vaadin/web-components?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Vaadin.Router

[Live Demo ↗](https://vaadin.github.io/vaadin-router/vaadin-router/demo)
|
[API documentation ↗](https://vaadin.github.io/vaadin-router/vaadin-router/)

<p align="center">
  <svg width="120" alt="router hero banner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 62">
    <style>
      .st0{fill:none;stroke:#2d3033;stroke-width:1.5;stroke-miterlimit:10}.st3{fill:#00b4f0}.st4{fill:#ff3a49}
    </style>
    <path class="st0" d="M33 31V6.4M6 55.6V31M33 55.6V31M59.9 55.6V31"/>
    <path d="M29.2 6.4c0 2.1 1.7 3.8 3.8 3.8s3.8-1.7 3.8-3.8c0-2.1-1.7-3.8-3.8-3.8s-3.8 1.7-3.8 3.8" fill="#2d3033"/>
    <path fill="#33383a" stroke="#2d3033" stroke-width="1.5" stroke-miterlimit="10" d="M6.1 31h53.8"/>
    <path class="st3" d="M2.3 31c0 2.1 1.7 3.8 3.8 3.8s3.8-1.7 3.8-3.8c0-2.1-1.7-3.8-3.8-3.8S2.3 28.9 2.3 31M59.9 34.8c2.1 0 3.8-1.7 3.8-3.8s-1.7-3.8-3.8-3.8c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8"/>
    <path class="st4" d="M33 34.8c2.1 0 3.8-1.7 3.8-3.8s-1.7-3.8-3.8-3.8c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8M2.3 55.6c0 2.1 1.7 3.8 3.8 3.8s3.8-1.7 3.8-3.8c0-2.1-1.7-3.8-3.8-3.8s-3.8 1.7-3.8 3.8"/>
    <path d="M59.9 59.5c2.1 0 3.8-1.7 3.8-3.8s-1.7-3.8-3.8-3.8c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8" fill="#ff3a4b"/>
    <path class="st3" d="M33 59.5c2.1 0 3.8-1.7 3.8-3.8s-1.7-3.8-3.8-3.8c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8"/>
  </svg>
  <h2 align="center">A client-side router for Web Components</h2>
</p>

Vaadin.Router is a small and powerful client-side router JS library. It uses the widely adopted express.js syntax for routes (`/users/:id`) to map URLs to Web Component views. All features one might expect from a modern router are supported: async route resolution, animated transitions, navigation guards, redirects, and more. It is framework-agnostic and works equally well with all Web Components regardless of how they are created (Polymer / SkateJS / Stencil / Angular / Vue / etc).

Vaadin.Router is a good fit for developers that do not want to go all-in with one framework, and prefer to have freedom in picking the components that work best for their specific needs.

```
npm install --save @vaadin/router
```

```javascript
import {Router} from '@vaadin/router';

const router = new Router(document.getElementById('outlet'));
router.setRoutes([
  {path: '/', component: 'x-home-view'},
  {path: '/users', component: 'x-user-list'}
]);
```

## Browser support
[![Sauce Test Status](https://saucelabs.com/browser-matrix/vaadin-router.svg)](https://saucelabs.com/u/vaadin-router)

Testing environments for Vaadin.Router are provided by [SauceLabs](https://saucelabs.com).


## Running demos and tests in the browser

1. Fork the `vaadin-router` repository and clone it locally.

1. Make sure you have [npm](https://www.npmjs.com/) installed.

1. When in the `vaadin-router` directory, run `npm install` and then `npm run install:dependencies` to install dependencies.

1. Run `npm start`, and open [http://127.0.0.1:8000/components/vaadin-router](http://127.0.0.1:8000/components/vaadin-router) in your browser to see the component API documentation.

1. You can also open demo or in-browser tests by adding **demo** or **test** to the URL, for example:

  - [http://127.0.0.1:8000/components/vaadin-router/demo](http://127.0.0.1:8000/components/vaadin-router/demo)
  - Public API tests: [http://127.0.0.1:8000/components/vaadin-router/test](http://127.0.0.1:8000/components/vaadin-router/test)
  - Unit tests: [http://127.0.0.1:8000/components/vaadin-router/test/index.coverage.html](http://127.0.0.1:8000/components/vaadin-router/test/index.coverage.html)


## Running tests from the command line

1. When in the `vaadin-router` directory, run `npm test`


## Following the coding style

We are using [ESLint](http://eslint.org/) for linting JavaScript code. You can check if your code is following our standards by running `npm run lint`, which will automatically lint all `.js` files as well as JavaScript snippets inside `.html` files.


## Contributing

  - Make sure your code is compliant with our code linters: `npm run lint`
  - Check that tests are passing: `npm test`
  - [Submit a pull request](https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github) with detailed title and description
  - Wait for response from one of Vaadin components team members


## License

Apache License 2.0

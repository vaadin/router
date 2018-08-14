[![NPM version](https://img.shields.io/npm/v/@vaadin/router.svg)](https://www.npmjs.com/package/@vaadin/router)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@vaadin/router.svg)](https://bundlephobia.com/result?p=@vaadin/router)
[![Build Status](https://travis-ci.org/vaadin/vaadin-router.svg?branch=master)](https://travis-ci.org/vaadin/vaadin-router)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/vaadin/web-components?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Vaadin Router

[Live Demo ↗](https://vaadin.github.io/vaadin-router/vaadin-router/demo)
|
[API documentation ↗](https://vaadin.github.io/vaadin-router/vaadin-router/)

<p align="center">
  <img width="120" alt="router hero banner" src="https://user-images.githubusercontent.com/22416150/42952145-74cead64-8b80-11e8-9dfd-09b01f904972.png">
  <h2 align="center">A client-side router for Web Components</h2>
</p>

Vaadin Router is a small and powerful client-side router JS library. It uses the widely adopted express.js syntax for routes (`/users/:id`) to map URLs to Web Component views. All features one might expect from a modern router are supported: async route resolution, animated transitions, navigation guards, redirects, and more. It is framework-agnostic and works equally well with all Web Components regardless of how they are created (Polymer / SkateJS / Stencil / Angular / Vue / etc).

Vaadin Router is a good fit for developers that do not want to go all-in with one framework, and prefer to have freedom in picking the components that work best for their specific needs.

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

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com).


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

Vaadin collects development time usage statistics to improve this product. For details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.

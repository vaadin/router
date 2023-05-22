[![NPM version](https://img.shields.io/npm/v/@vaadin/router.svg)](https://www.npmjs.com/package/@vaadin/router)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@vaadin/router.svg)](https://bundlephobia.com/result?p=@vaadin/router)

# Vaadin Router

[Demo](https://vaadin.github.io/router/vaadin-router/demo)
·
[API documentation](https://vaadin.github.io/router/vaadin-router/)

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

A specific version of Vaadin Router supports the same browsers as the Vaadin platform major version which includes that version of Vaadin Router.
See [Vaadin platform release notes](https://github.com/vaadin/platform/releases) for details on included Vaadin Router version and supported technologies.
The Supported Technologies section is typically listed in the release notes of the first publicly available release of a Vaadin platform major version
(for example [Vaadin 18.0.1](https://github.com/vaadin/platform/releases/tag/18.0.1) since 18.0.0 was skipped).

### Desktop browsers

Evergreen versions of the following browsers
- Chrome, Firefox, Firefox ESR, Safari and Edge (Chromium)

### Mobile browsers

Built-in browsers in the following mobile operating systems:
- Safari starting from iOS 13 (Safari 13 or newer)
- Google Chrome evergreen on Android (requiring Android 4.4 or newer)

### Sauce Labs test status

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
  - Unit tests: [http://127.0.0.1:8000/components/vaadin-router/test/index.html](http://127.0.0.1:8000/components/vaadin-router/test/index.html)


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

import UniversalRouter from 'universal-router';

import {toArray, ensureRoutes} from './utils.js';

function resolveRoute(context, params) {
  const route = context.route;
  // TODO: export this from UniversalRouter
  if (typeof route.action === 'function') {
    return route.action(context, params);
  } else if (typeof route.component === 'string') {
    return Router.renderComponent(route.component, context);
  }
}

const DEFAULT_OPTIONS = {
  baseUrl: '',
  resolveRoute: resolveRoute
};

/**
 * @typedef RouterOptions
 * @type {object}
 * @property {string} baseUrl - a base URL for the router
 * @property {boolean} popstate - whether or not listen to popstate events
 */

/**
 * @typedef Route
 * @type {object}
 * @property {!string} path
 * @property {?string} component
 * @property {?string} importUrl
 * @property {?function(context, next)} action
 * @property {?Array<Route>} children
 */

/**
 * A simple client-side router for single-page applications. It uses
 * express-style middleware and has a first-class support for Web Components and
 * lazy-loading. Works great in Polymer and non-Polymer apps.
 * 
 * ### Basic example
 * ```
 * const routes = [
 *   { path: '/', component: 'x-home-view' },
 *   { path: '/users', component: 'x-user-list' }
 * ];
 * 
 * const router = new Vaadin.Router(routes, document.getElementById('outlet'));
 * router.start();
 * ```
 * 
 * ### Lazy-loading example
 * A bit more involved example with lazy-loading:
 * ```
 * const routes = [
 *   { path: '/', component: 'x-home-view' },
 *   { path: '/users',
 *     importUrl: 'bundles/user-bundle.html',
 *     children: [
 *       { path: '/', component: 'x-user-list' },
 *       { path: '/:user', component: 'x-user-profile' }
 *     ]
 *   }
 * ];
 * 
 * const router = new Vaadin.Router(routes);
 * window.addEventListener('popstate', async (event) => {
 *   const dom = await router.resolve(window.location.pathname);
 *   myCustomDomAppender(dom);
 * });
 * ```
 * 
 * ### Middleware example
 * A more complex example with custom route handers and server-side rendered
 * content:
 * ```
 * const routes = [
 *   { path: '/',
 *     action: async (context, next) => {
 *       // record the navigation completed event for analytics
 *       analytics.recordNavigationStart(context.path);
 * 
 *       // let the navigation happen and wait for the result
 *       const result = await next();
 * 
 *       // record the navigation completed event for analytics
 *       analytics.recordNavigationEnd(context.path, result.status);
 *       
 *       // pass the result up the handlers chain
 *       return result;
 *     }
 *   },
 *   { path: '/', component: 'x-home-view' },
 *   { path: '/users',
 *     importUrl: 'bundles/user-bundle.html',
 *     children: [
 *       { path: '/', component: 'x-user-list' },
 *       { path: '/:user', component: 'x-user-profile' }
 *     ]
 *   },
 *   { path: '/server',
 *     action: async (context, next) => {
 *       // fetch the server-side rendered content
 *       const result = await fetch(context.path, {...});
 * 
 *       // modify the content if necessary
 *       result.body = result.body.replace(/bad/ig, 'good');
 *       
 *       // create DOM objects out of the server-side result (string)
 *       return renderToDom(result);
 *     }
 *   }
 * ];
 * 
 * const router = new Vaadin.Router(routes);
 * window.addEventListener('popstate', async (event) => {
 *   const dom = await router.resolve(window.location.pathname);
 *   myCustomDomAppender(dom);
 * });
 * ```
 * 
 * @memberof Vaadin
 * @summary JavaScript class that renders different DOM content depending on
 *    a given path. It can re-render when triggered or on the 'popstate' event.
 */
export class Router {
  
  /**
   * Creates a new Router instance with a given routes configuration.
   * Equivalent to
   * ```
   * const router = new Vaadin.Router();
   * router.setRoutes(routes);
   * router.setOutlet(outlet);
   * router.setOptions(options);
   * ```
   *
   * @param {Array<Route>} routes
   * @param {?Node} outlet
   * @param {?RouterOptions} options
   */
  constructor(routes, outlet, options) {
    routes = routes || [];
    ensureRoutes(routes);

    this.__routes = routes;
    this.__outlet = outlet;
    this.__options = Object.assign(DEFAULT_OPTIONS, options);
    this.__router = new UniversalRouter(this.__routes, this.__options);
  }

  /**
   * Returns the current set of router options.
   * 
   * @return {!RouterOptions}
   */
  getOptions() {
    return Object.assign({}, this.__options);
  }

  /**
   * Updates one or several router options. Only the options properties that are
   * present in the parameter object are updated.
   * 
   * Returns the effective options set the update.
   * 
   * @param {?RouterOptions} options
   * @return {!RouterOptions}
   */
  setOptions(options) {
    if ('baseUrl' in options) {
      this.__options.baseUrl = options.baseUrl;
      this.__router.baseUrl = options.baseUrl;
    }
    return this.getOptions();
  }

  /**
   * Returns the current list of routes (as a shallow copy). Adding / removing
   * routes to / from the returned array does not affect the routing config,
   * but modifying the route objects does.
   * 
   * @return {!Array<!Route>}
   */
  getRoutes() {
    return [...this.__routes];
  }

  /**
   * Sets the routing config (replacing the existing one) and returns the
   * effective routing config after the opertaion.
   * 
   * @param {!Array<!Route>|!Route} routes a single route or an array of those
   *    (the array is shallow copied)
   * @return {!Array<!Route>}
   */
  setRoutes(routes) {
    ensureRoutes(routes);
    this.__routes = [...toArray(routes)];
    this.__router.root.children = this.__routes;
  }

  /**
   * Appends one or several routes to the routing config and returns the
   * effective routing config after the operation.
   * 
   * @param {!Array<!Route>|!Route} routes a single route or an array of those
   *    (the array is shallow copied)
   * @return {!Array<!Route>}
   */
  addRoutes(routes) {
    ensureRoutes(routes);
    this.__routes.push(...toArray(routes));
  }

  /**
   * Removes one or several routes from the routing config and returns the
   * effective routing config after the operation. The routes to remove are
   * searched in the routing config by reference equality, i.e. pass in the
   * exact route references that need to be removed.
   * 
   * @param {!Array<!Route>|!Route} routes a single route or an array of those
   * @return {!Array<!Route>}
   */
  removeRoutes(routes) {
    toArray(routes).forEach(route => {
      const index = this.__routes.indexOf(route);
      if (index > -1) {
        this.__routes.splice(index, 1);
      }
    });
  }

  /**
   * Returns the current router outlet.
   * 
   * @return {Node}
   */
  getOutlet() {
    return this.__outlet;
  }

  /**
   * Sets the router outlet.
   * 
   * @param {Node} outlet
   */
  setOutlet(outlet) {
    this.__outlet = outlet;
  }

  /**
   * Resolves the given path, i.e. calls all matching route handlers and returns
   * the result (as a promise).
   * 
   * If no route matches the given path the returned promise is rejected.
   *
   * @param {!string} path the path to resolve
   * @param {?object} context an optional context to pass to route handlers
   * @return {Promise<HTMLElement>}
   */
  resolve(path, context) {
    return this.__router.resolve(Object.assign({pathname: path}, context));
  }

  /**
   * Resolves the given path and renders the route DOM into the router outlet if
   * it is set. If no router outlet is set at the time of calling this method,
   * it throws an Error.
   * 
   * Returns a promise that is fullfilled after the route DOM is inserted into
   * the router outlet, or rejected if no route matches the given path.
   * 
   * @param {!string} path the path to render
   * @param {?object} context an optional context to pass to route handlers
   * @return {Promise<Node>}
   */
  render(path, context) {
    // TODO(vlukashov): handle the 'no outlet' case
    return this.resolve(path, context)
      .then(dom => {
        // TODO(vlukashov): handle the 'no outlet' case
        if (this.__outlet) {
          const children = this.__outlet.children;
          if (children && children.length) {
            const parent = children[0].parentNode;
            for (let i = 0; i < children.length; i += 1) {
              parent.removeChild(children[i]);
            }
          }

          this.__outlet.appendChild(dom);
          return this.__outlet;
        }
      });
  }

  /**
   * Registers the router for the 'popstate' events on the window object
   * and automatically calls the `render()` method every time when the history
   * state changes.
   */
  start() {
    // TODO(vlukashov): implement Router.start()
  }

  /**
   * Removes the 'popstate' event registration added in the `start()` method.
   */
  stop() {
    // TODO(vlukashov): implement Router.stop()
  }

  /**
   * Creates and returns an instance of a given custom element.
   * 
   * @param {!string} component tag name of a web component to render
   * @param {?context} context an optional context object
   * @return {!HTMLElement}
   */
  static renderComponent(component, context) {
    const element = document.createElement(component);
    for (const param of Object.keys(context.params)) {
      element[param] = context.params[param];
    }
    return element;
  }
}


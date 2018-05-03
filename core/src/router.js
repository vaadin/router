import Resolver from './resolver/resolver.js';
import {toArray, ensureRoutes} from './utils.js';

function resolveRoute(context, params) {
  const route = context.route;
  // TODO(vlukashov): export this from UniversalRouter
  if (typeof route.action === 'function') {
    return route.action(context, params);
  } else if (typeof route.component === 'string') {
    return Router.renderComponent(route.component, context);
  }
}

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
 * const router = new Vaadin.Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 * 
 * ### Lazy-loading example
 * A bit more involved example with lazy-loading:
 * ```
 * const routes = [
 *   { path: '/', component: 'x-home-view' },
 *   { path: '/users',
 *     bundle: 'bundles/user-bundle.html',
 *     children: [
 *       { path: '/', component: 'x-user-list' },
 *       { path: '/:user', component: 'x-user-profile' }
 *     ]
 *   }
 * ];
 * 
 * const router = new Vaadin.Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 * 
 * ### Middleware example
 * A more complex example with custom route handers and server-side rendered
 * content:
 * ```
 * const routes = [
 *   { path: '/',
 *     action: async (context) => {
 *       // record the navigation completed event for analytics
 *       analytics.recordNavigationStart(context.path);
 * 
 *       // let the navigation happen and wait for the result
 *       const result = await context.next();
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
 *     bundle: 'bundles/user-bundle.html',
 *     children: [
 *       { path: '/', component: 'x-user-list' },
 *       { path: '/:user', component: 'x-user-profile' }
 *     ]
 *   },
 *   { path: '/server',
 *     action: async (context) => {
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
 * const router = new Vaadin.Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 * 
 * @memberof Vaadin
 * @summary JavaScript class that renders different DOM content depending on
 *    a given path. It can re-render when triggered or on the 'popstate' event.
 */
export class Router {
  
  /**
   * Creates a new Router instance with a given outlet.
   * Equivalent to
   * ```
   * const router = new Vaadin.Router();
   * router.setOutlet(outlet);
   * ```
   *
   * @param {?Node} outlet
   * @param {?RouterOptions} options
   */
  constructor(outlet) {
    this.__resolver = new Resolver([], {resolveRoute});
    this.setOutlet(outlet);
  }

  /**
   * Returns the current set of router options.
   * 
   * @return {!RouterOptions}
   */
  getOptions() {
    throw new Error('TODO(vlukashov): Router.getOptions() is not implemented');
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
    throw new Error('TODO(vlukashov): Router.setOptions() is not implemented');
  }

  /**
   * Returns the current list of routes (as a shallow copy). Adding / removing
   * routes to / from the returned array does not affect the routing config,
   * but modifying the route objects does.
   * 
   * @return {!Array<!Route>}
   */
  getRoutes() {
    return this.__resolver.root.children;
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
    this.__resolver.root.children = [...toArray(routes)];
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
    this.__resolver.root.children.push(...toArray(routes));
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
    throw new Error('TODO(vlukashov): Router.removeRoutes() is not implemented');
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
    return this.__resolver.resolve(Object.assign({pathname: path}, context));
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
      .then(element => {
        // TODO(vlukashov): handle the 'no outlet' case
        if (this.__outlet) {
          const children = this.__outlet.children;
          if (children && children.length) {
            const parent = children[0].parentNode;
            for (let i = 0; i < children.length; i += 1) {
              parent.removeChild(children[i]);
            }
          }

          this.__outlet.appendChild(element);
          return this.__outlet;
        }
      });
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


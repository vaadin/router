import UniversalRouter from './resolver/UniversalRouter';
import {toArray, ensureRoutes} from './utils';

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
 * @memberof Vaadin
 */
export class Resolver {
  constructor(routes, options) {
    ensureRoutes(routes);
    this.__routes = [...toArray(routes)];
    this.__router = new UniversalRouter(this.__routes, options);
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
}


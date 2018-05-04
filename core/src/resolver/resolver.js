/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import pathToRegexp from './path-to-regexp.js';
import matchRoute from './matchRoute.js';
import resolveRoute from './resolveRoute.js';
import {toArray, ensureRoutes} from '../utils.js';

function isChildRoute(parentRoute, childRoute) {
  let route = childRoute;
  while (route) {
    route = route.parent;
    if (route === parentRoute) {
      return true;
    }
  }
  return false;
}

/**
 * @memberof Vaadin
 */
class Resolver {
  constructor(routes, options = {}) {
    if (Object(routes) !== routes) {
      throw new TypeError('Invalid routes');
    }

    this.baseUrl = options.baseUrl || '';
    this.errorHandler = options.errorHandler;
    this.resolveRoute = options.resolveRoute || resolveRoute;
    this.context = Object.assign({resolver: this}, options.context);
    this.root = Array.isArray(routes) ? {path: '', children: routes, parent: null} : routes;
    this.root.parent = null;
    this.ready = Promise.resolve();
  }

  /**
   * Returns the current list of routes (as a shallow copy). Adding / removing
   * routes to / from the returned array does not affect the routing config,
   * but modifying the route objects does.
   * 
   * @return {!Array<!Route>}
   */
  getRoutes() {
    return this.root.children;
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
    this.root.children = [...toArray(routes)];
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
    this.root.children.push(...toArray(routes));
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
    throw new Error('TODO(vlukashov): Resolver.removeRoutes() is not implemented');
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
  resolve(pathnameOrContext) {
    const context = Object.assign(
      {},
      this.context,
      typeof pathnameOrContext === 'string' ? {pathname: pathnameOrContext} : pathnameOrContext
    );
    const match = matchRoute(
      this.root,
      context.pathname.substr(this.baseUrl.length)
    );
    const resolve = this.resolveRoute;
    let matches = null;
    let nextMatches = null;
    let currentContext = context;

    function next(resume, parent = matches.value.route, prevResult) {
      const routeToSkip = prevResult === null && matches.value.route;
      matches = nextMatches || match.next(routeToSkip);
      nextMatches = null;

      if (!resume) {
        if (matches.done || !isChildRoute(parent, matches.value.route)) {
          nextMatches = matches;
          return Promise.resolve(null);
        }
      }

      if (matches.done) {
        const error = new Error(`Page not found (${context.pathname})`);
        error.context = context;
        error.code = 404;
        return Promise.reject(error);
      }

      currentContext = Object.assign({}, context, matches.value);

      return Promise.resolve(resolve(currentContext, matches.value.params)).then((result) => {
        if (result !== null && result !== undefined) {
          return result;
        }
        return next(resume, parent, result);
      });
    }

    context.next = next;

    this.ready = Promise.resolve()
      .then(() => next(true, this.root))
      .catch((error) => {
        error.context = error.context || currentContext;
        error.code = error.code || 500;
        if (this.errorHandler) {
          return this.errorHandler(error);
        }
        throw error;
      });
    return this.ready; 
  }
}

Resolver.pathToRegexp = pathToRegexp;

export default Resolver;

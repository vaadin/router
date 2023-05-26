/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import matchRoute from './matchRoute.js';
import resolveRoute from './resolveRoute.js';
import {
  ContextWithChain,
  ensureRoutes,
  getNotFoundError,
  type InternalContext,
  type InternalContextNextFn,
  isString,
  notFoundResult, ResolveResult,
  toArray
} from '../utils.js';
import {ActionResult, Context, Route} from "../types/route";

function isChildRoute(parentRoute: Route, childRoute: Route) {
  let route = childRoute;
  while (route) {
    route = route.parent;
    if (route === parentRoute) {
      return true;
    }
  }
  return false;
}

function generateErrorMessage(currentContext: Context): string {
  let errorMessage = `Path '${currentContext.pathname}' is not properly resolved due to an error.`;
  const routePath = (currentContext.route || {}).path;
  if (routePath) {
    errorMessage += ` Resolution had failed on route: '${routePath}'`;
  }
  return errorMessage;
}

function updateChainForRoute(context: InternalContext, match: {route: Route, path: string}): asserts context is ContextWithChain {
  const {route, path} = match;

  if (route && !route.__synthetic) {
    const item = {path, route};
    if (!context.chain) {
      context.chain = [];
    } else {
      // Discard old items
      if (route.parent) {
        let i = context.chain.length;
        while (i-- && context.chain[i].route && context.chain[i].route !== route.parent) {
          context.chain.pop();
        }
      }
    }
    context.chain.push(item);
  }
}

export type ErrorHandlerFn = (error: any) => ActionResult;

export type ResolverOptions = Readonly<{
  baseUrl?: string,
  errorHandler?: ErrorHandlerFn,
  resolveRoute?: typeof resolveRoute,
  context?: Context,
}>;

/**
 */
class Resolver {
  baseUrl: string;
  errorHandler?: ErrorHandlerFn;
  resolveRoute: typeof resolveRoute;
  context: InternalContext;
  root: Route;

  constructor(routes, options: ResolverOptions = {}) {
    if (Object(routes) !== routes) {
      throw new TypeError('Invalid routes');
    }

    this.baseUrl = options.baseUrl || '';
    this.errorHandler = options.errorHandler;
    this.resolveRoute = options.resolveRoute || resolveRoute;
    this.context = Object.assign({
      resolver: this,
      pathname: '',
      search: '',
      hash: '',
      params: {},
      route: this.root,
      next: () => Promise.resolve(notFoundResult),
    }, options.context || {});
    this.root = Array.isArray(routes) ? {path: '', __children: routes, parent: null, __synthetic: true} : routes;
    this.root.parent = null;
  }

  /**
   * Returns the current list of routes (as a shallow copy). Adding / removing
   * routes to / from the returned array does not affect the routing config,
   * but modifying the route objects does.
   */
  getRoutes(): Route[] {
    return [...this.root.__children];
  }

  /**
   * Sets the routing config (replacing the existing one).
   *
   * @param routes a single route or an array of those
   *    (the array is shallow copied)
   */
  setRoutes(routes: Route|ReadonlyArray<Route>): void {
    ensureRoutes(routes);
    this.root.__children = [...toArray(routes)];
  }

  /**
   * Appends one or several routes to the routing config and returns the
   * effective routing config after the operation.
   *
   * @param routes a single route or an array of those
   *    (the array is shallow copied)
   */
  protected addRoutes(routes: Route | ReadonlyArray<Route>): ReadonlyArray<Route> {
    ensureRoutes(routes);
    this.root.__children.push(...toArray(routes));
    return this.getRoutes();
  }

  /**
   * Removes all existing routes from the routing config.
   */
  removeRoutes(): void {
    this.setRoutes([]);
  }

  /**
   * Asynchronously resolves the given pathname, i.e. finds all routes matching
   * the pathname and tries resolving them one after another in the order they
   * are listed in the routes until the first non-null result.
   *
   * Returns a promise that is fulfilled with the return value of an object that consists of the first
   * route handler result that returns something other than `null` or `undefined` and context used to get this result.
   *
   * If no route handlers return a non-null result, or if no route matches the
   * given pathname the returned promise is rejected with a 'page not found'
   * `Error`.
   *
   * @param pathnameOrContext the pathname to resolve or a context object
   * with a `pathname` property and other properties to pass to the route
   * resolver functions.
   */
  resolve(pathnameOrContext: string | {pathname: string}): Promise<InternalContext> {
    const context: InternalContext = Object.assign(
      {},
      this.context,
      isString(pathnameOrContext) ? {pathname: pathnameOrContext} : pathnameOrContext,
      {next: next}
    );
    const match = matchRoute(
      this.root,
      this.__normalizePathname(context.pathname),
      !!this.baseUrl
    );
    const resolve = this.resolveRoute;
    let matches = null;
    let nextMatches = null;
    let currentContext = context;

    const next: InternalContextNextFn = (resume: boolean = false, parent: Route = matches.value.route, prevResult: ResolveResult = null) => {
      const routeToSkip = prevResult === null && matches.value.route;
      matches = nextMatches || match.next(routeToSkip);
      nextMatches = null;

      if (!resume) {
        if (matches.done || !isChildRoute(parent, matches.value.route)) {
          nextMatches = matches;
          return Promise.resolve(notFoundResult);
        }
      }

      if (matches.done) {
        return Promise.reject(getNotFoundError(context));
      }

      currentContext = Object.assign(
        currentContext
          ? {chain: (currentContext.chain ? currentContext.chain.slice(0) : [])}
          : {},
        context,
        matches.value
      );
      updateChainForRoute(currentContext, matches.value);

      return Promise.resolve(resolve(currentContext as InternalContext)).then(resolution => {
        if (resolution !== null && resolution !== undefined && resolution !== notFoundResult) {
          currentContext.result = (('result' in resolution) ? resolution.result : resolution) as ActionResult;
          return currentContext as ContextWithChain;
        }
        return next(resume, parent, resolution);
      });
    };

    return Promise.resolve()
      .then(() => next(true, this.root) as Promise<InternalContext>)
      .catch((error) => {
        const errorMessage = generateErrorMessage(currentContext);
        if (!error) {
          error = new Error(errorMessage);
        } else {
          console.warn(errorMessage);
        }
        error.context = error.context || currentContext;
        // DOMException has its own code which is read-only
        if (!(error instanceof DOMException)) {
          error.code = error.code || 500;
        }
        if (this.errorHandler) {
          currentContext.result = this.errorHandler(error);
          return currentContext;
        }
        throw error;
      });
  }

  /**
   * URL constructor polyfill hook. Creates and returns a URL instance.
   */
  static __createUrl(...args: ConstructorParameters<typeof URL>): InstanceType<typeof URL> {
    return new URL(...args);
  }

  /**
   * If the baseUrl property is set, transforms the baseUrl and returns the full
   * actual `base` string for using in the `new URL(path, base);` and for
   * prepending the paths with. The returned base ends with a trailing slash.
   *
   * Otherwise, returns empty string.
   */
  get __effectiveBaseUrl(): string {
    return this.baseUrl
      ? (this.constructor as typeof Resolver).__createUrl(
        this.baseUrl,
        document.baseURI || document.URL
      ).href.replace(/[^/]*$/, '')
      : '';
  }

  /**
   * If the baseUrl is set, matches the pathname with the router’s baseUrl,
   * and returns the local pathname with the baseUrl stripped out.
   *
   * If the pathname does not match the baseUrl, returns undefined.
   *
   * If the `baseUrl` is not set, returns the unmodified pathname argument.
   */
  __normalizePathname(pathname: string): string {
    if (!this.baseUrl) {
      // No base URL, no need to transform the pathname.
      return pathname;
    }

    const base = this.__effectiveBaseUrl;
    // Convert pathname to a valid URL constructor argument
    const url = pathname[0] === '/'
      ? (this.constructor as typeof Resolver).__createUrl(base).origin + pathname
      : './' + pathname;
    const normalizedUrl = (this.constructor as typeof Resolver).__createUrl(url, base).href;
    if (normalizedUrl.slice(0, base.length) === base) {
      return normalizedUrl.slice(base.length);
    }
  }
}

export default Resolver;

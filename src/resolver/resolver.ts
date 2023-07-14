/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import type { InternalContext, InternalRoute } from '../internal.js';
import type { ActionResult, EmptyRecord, Route } from '../types.js';
import { ensureRoutes, getNotFoundError, getRoutePath, isString, notFoundResult, toArray } from '../utils.js';
import matchRoute, { type MatchWithRoute } from './matchRoute.js';
import defaultResolveRoute from './resolveRoute.js';

function isDescendantRoute<T, R extends Record<string, unknown>, C extends Record<string, unknown>>(
  route?: InternalRoute<T, R, C>,
  maybeParent?: InternalRoute<T, R, C>,
) {
  let _route = route;
  while (_route) {
    _route = _route.parent;
    if (_route === maybeParent) {
      return true;
    }
  }
  return false;
}

function generateErrorMessage<T, R extends Record<string, unknown>, C extends Record<string, unknown>>(
  context: InternalContext<T, R, C>,
) {
  let errorMessage = `Path '${context.pathname}' is not properly resolved due to an error.`;

  const routePath = getRoutePath(context.route);
  if (routePath) {
    errorMessage += ` Resolution had failed on route: '${routePath}'`;
  }
  return errorMessage;
}

export interface ResolutionErrorOptions extends ErrorOptions {
  code?: number;
}

export class ResolutionError<T, R extends Record<string, unknown>, C extends Record<string, unknown>> extends Error {
  readonly code?: number;
  readonly context: InternalContext<T, R, C>;

  constructor(context: InternalContext<T, R, C>, options?: ResolutionErrorOptions) {
    super(generateErrorMessage(context), options);
    this.code = options?.code;
    this.context = context;
  }

  warn(): void {
    console.warn(this.message);
  }
}

type Match<T, R extends Record<string, unknown>, C extends Record<string, unknown>> = Readonly<{
  path: string;
  route?: InternalRoute<T, R, C>;
}>;

function updateChainForRoute<T, R extends Record<string, unknown>, C extends Record<string, unknown>>(
  context: InternalContext<T, R, C>,
  match: Match<T, R, C>,
) {
  const { path, route } = match;

  if (route && !route.__synthetic) {
    const item = { path, route };
    if (!context.chain) {
      context.chain = [];
    } else if (route.parent) {
      for (let i = context.chain.length - 1; i >= 0; i--) {
        if (!context.chain[i].route || context.chain[i].route === route.parent) {
          break;
        }

        context.chain.pop();
      }
    }
    context.chain.push(item);
  }
}

export type ErrorHandlerCallback<T> = (error: unknown) => ActionResult<T>;

export type ResolveContext = Readonly<{ pathname: string }>;

export type ResolverOptions<T, C extends Record<string, unknown> = EmptyRecord> = Readonly<{
  baseUrl?: string;
  context?: C;
  errorHandler?: ErrorHandlerCallback<T>;
  resolveRoute?: typeof defaultResolveRoute;
}>;

class Resolver<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
> {
  /**
   * URL constructor polyfill hook. Creates and returns a URL instance.
   */
  static __createUrl(...args) {
    return new URL(...args);
  }

  readonly baseUrl: string;
  readonly defaultContext: InternalContext<T, R, C>
  context: InternalContext<T, R, C>;
  readonly errorHandler?: ErrorHandlerCallback<T>;
  readonly resolveRoute: typeof defaultResolveRoute;
  readonly root: InternalRoute<T, R, C>;

  constructor(
    routes: ReadonlyArray<Route<T, R, C>> | Route<T, R, C>,
    { baseUrl = '', context = {}, errorHandler, resolveRoute = defaultResolveRoute }: ResolverOptions<T> = {},
  ) {
    if (Object(routes) !== routes) {
      throw new TypeError('Invalid routes');
    }

    this.baseUrl = baseUrl;
    this.errorHandler = errorHandler;
    this.resolveRoute = resolveRoute;
    this.root = Array.isArray(routes)
      ? {
          __children: routes,
          __synthetic: true,
          action() {},
          path: '',
        }
      : { ...routes, parent: undefined };

    this.defaultContext = {
      ...context,
      hash: '',
      async next() {
        return Promise.resolve(notFoundResult);
      },
      params: {},
      pathname: '',
      resolver: this,
      route: this.root,
      search: '',
    };
  }

  /**
   * If the baseUrl property is set, transforms the baseUrl and returns the full
   * actual `base` string for using in the `new URL(path, base);` and for
   * prepernding the paths with. The returned base ends with a trailing slash.
   *
   * Otherwise, returns empty string.
   */
  get __effectiveBaseUrl(): string {
    return this.baseUrl ? new URL(this.baseUrl, document.baseURI || document.URL).href.replace(/[^/]*$/u, '') : '';
  }

  /**
   * Returns the current list of routes (as a shallow copy). Adding / removing
   * routes to / from the returned array does not affect the routing config,
   * but modifying the route objects does.
   *
   * @public
   */
  getRoutes(): ReadonlyArray<Route<T, R, C>> {
    return [...(this.root.__children ?? [])];
  }

  /**
   * Removes all existing routes from the routing config.
   *
   * @public
   */
  removeRoutes(): void {
    this.root.__children = [];
  }

  /**
   * Asynchronously resolves the given pathname, i.e. finds all routes matching
   * the pathname and tries resolving them one after another in the order they
   * are listed in the routes config until the first non-null result.
   *
   * Returns a promise that is fulfilled with the return value of an object that consists of the first
   * route handler result that returns something other than `null` or `undefined` and context used to get this result.
   *
   * If no route handlers return a non-null result, or if no route matches the
   * given pathname the returned promise is rejected with a 'page not found'
   * `Error`.
   *
   * @param pathnameOrContext - the pathname to
   *    resolve or a context object with a `pathname` property and other
   *    properties to pass to the route resolver functions.
   */
  async resolve(pathnameOrContext: ResolveContext | string): Promise<ActionResult<T>> {
    const self = this;
    const context: InternalContext<T, R, C> = {
      ...this.context,
      ...(isString(pathnameOrContext) ? { pathname: pathnameOrContext } : pathnameOrContext),
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      next,
    };
    const match = matchRoute(this.root, this.__normalizePathname(context.pathname) ?? context.pathname, !!this.baseUrl);
    const resolve = this.resolveRoute;
    let matches: IteratorResult<MatchWithRoute<T, R, C>, undefined> | null = null;
    let nextMatches: IteratorResult<MatchWithRoute<T, R, C>, undefined> | null = null;
    let currentContext = context;

    async function next(
      resume: boolean = false,
      parent: InternalRoute<T, R, C> | undefined = matches?.value?.route,
      prevResult?: ActionResult<T> | null,
    ): Promise<ActionResult<T>> {
      const routeToSkip = prevResult === null ? matches?.value?.route : undefined;
      matches = nextMatches ?? match.next(routeToSkip);
      nextMatches = null;

      if (!resume) {
        if (matches.done || !isDescendantRoute(matches.value.route, parent)) {
          nextMatches = matches;
          return notFoundResult;
        }
      }

      if (matches.done) {
        throw getNotFoundError(context);
      }

      currentContext = {
        chain: currentContext.chain ? currentContext.chain.slice() : [],
        ...context,
        ...matches.value,
      };
      updateChainForRoute(currentContext, matches.value);

      const resolution = await resolve(currentContext);

      if (resolution !== null && resolution !== undefined && resolution !== notFoundResult) {
        currentContext.result = resolution;
        self.context = currentContext;
        return resolution;
      }
      return next(resume, parent, resolution);
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    // TODO: fix error handling
    return next(true, this.root).catch((error: any) => {
      const errorMessage = generateErrorMessage(currentContext);
      if (!error) {
        // eslint-disable-next-line no-param-reassign
        error = new Error(errorMessage);
      } else {
        console.warn(errorMessage);
      }
      error.context ??= currentContext;
      // DOMException has its own code which is read-only
      if (!(error instanceof DOMException)) {
        error.code ??= 500;
      }
      if (this.errorHandler) {
        currentContext.result = this.errorHandler(error);
        return currentContext.result;
      }
      throw error;
    });
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  }

  /**
   * Sets the routing config (replacing the existing one).
   *
   * @param routes - a single route or an array of those
   *    (the array is shallow copied)
   */
  setRoutes(routes: ReadonlyArray<Route<T, R, C>> | Route<T, R, C>): void {
    ensureRoutes(routes);
    this.root.__children = [...toArray(routes)];
  }

  /**
   * If the baseUrl is set, matches the pathname with the router’s baseUrl,
   * and returns the local pathname with the baseUrl stripped out.
   *
   * If the pathname does not match the baseUrl, returns undefined.
   *
   * If the `baseUrl` is not set, returns the unmodified pathname argument.
   */
  protected __normalizePathname(pathname: string): string | undefined {
    if (!this.baseUrl) {
      // No base URL, no need to transform the pathname.
      return pathname;
    }

    const base = this.__effectiveBaseUrl;
    // Convert pathname to a valid URL constructor argument
    const url = pathname.startsWith('/') ? new URL(base).origin + pathname : `./${pathname}`;
    const normalizedUrl = new URL(url, base).href;
    if (normalizedUrl.startsWith(base)) {
      return normalizedUrl.slice(base.length);
    }

    return undefined;
  }

  /**
   * Appends one or several routes to the routing config and returns the
   * effective routing config after the operation.
   *
   * @param routes - a single route or an array of those
   *    (the array is shallow copied)
   */
  protected addRoutes(routes: ReadonlyArray<Route<T, R, C>> | Route<T, R, C>): ReadonlyArray<Route<T, R, C>> {
    ensureRoutes(routes);
    this.root.__children = [...(this.root.__children ?? []), ...toArray(routes)];
    return this.getRoutes();
  }
}

export default Resolver;

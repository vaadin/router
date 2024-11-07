/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import type { EmptyObject } from 'type-fest';
import matchRoute, { type MatchWithRoute } from './matchRoute.js';
import defaultResolveRoute from './resolveRoute.js';
import type { ActionResult, Route, Match, MaybePromise, ResolveContext, RouteContext } from './types.t.js';
import { getNotFoundError, getRoutePath, isString, NotFoundError, notFoundResult, toArray } from './utils.js';

function isDescendantRoute<T, R extends object, C extends object>(
  route?: Route<T, R, C>,
  maybeParent?: Route<T, R, C>,
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

function isRouteContext<T, R extends object, C extends object>(value: unknown): value is RouteContext<T, R, C> {
  return (
    !!value &&
    typeof value === 'object' &&
    'next' in value &&
    'params' in value &&
    'result' in value &&
    'route' in value
  );
}

export interface ResolutionErrorOptions {
  code?: number;
}

/**
 * An error that is thrown when a route resolution fails.
 */
export class ResolutionError<T, R extends object = EmptyObject, C extends object = EmptyObject> extends Error {
  /**
   * A HTTP status code associated with the error.
   */
  readonly code?: number;

  /**
   * The context object associated with the route that was not found.
   */
  readonly context: RouteContext<T, R, C>;

  constructor(context: RouteContext<T, R, C>, options?: ResolutionErrorOptions) {
    let errorMessage = `Path '${context.pathname}' is not properly resolved due to an error.`;
    const routePath = getRoutePath(context.route);
    if (routePath) {
      errorMessage += ` Resolution had failed on route: '${routePath}'`;
    }
    super(errorMessage);
    this.code = options?.code;
    this.context = context;
  }

  /**
   * Logs the error message to the console as a warning.
   */
  warn(): void {
    console.warn(this.message);
  }
}

function updateChainForRoute<T, R extends object, C extends object>(
  context: RouteContext<T, R, C>,
  match: Match<T, R, C>,
) {
  const { path, route } = match;

  if (route && !route.__synthetic) {
    const item = { path, route };
    if (route.parent && context.chain) {
      for (let i = context.chain.length - 1; i >= 0; i--) {
        if (context.chain[i].route === route.parent) {
          break;
        }

        context.chain.pop();
      }
    }
    context.chain?.push(item);
  }
}

/**
 * A callback function that handles errors during route resolution.
 */
export type ErrorHandlerCallback<T> = (error: unknown) => T;

/**
 * A callback function that resolves a route. It is used as a fallback in case
 * the route is not correctly resolved.
 */
export type ResolveRouteCallback<T, R extends object, C extends object> = (
  context: RouteContext<T, R, C>,
) => MaybePromise<ActionResult<T | RouteContext<T, R, C>>>;

/**
 * Options for the constructor of the `Resolver` class.
 *
 * @interface
 */
export type ResolverOptions<T, R extends object, C extends object> = Readonly<{
  baseUrl?: string;
  context?: RouteContext<T, R, C>;
  errorHandler?: ErrorHandlerCallback<T>;
  resolveRoute?: ResolveRouteCallback<T, R, C>;
}>;

class Resolver<T = unknown, R extends object = EmptyObject, C extends object = EmptyObject> {
  /**
   * The base URL for all routes in the router instance. By default,
   * if the base element exists in the `<head>`, vaadin-router
   * takes the `<base href>` attribute value, resolved against the current
   * `document.URL`.
   */
  readonly baseUrl: string;
  #context: RouteContext<T, R, C>;
  readonly errorHandler?: ErrorHandlerCallback<T>;
  readonly resolveRoute: ResolveRouteCallback<T, R, C>;
  readonly #root: Route<T, R, C>;

  constructor(routes: ReadonlyArray<Route<T, R, C>> | Route<T, R, C>, options?: ResolverOptions<T, R, C>);
  constructor(
    routes: ReadonlyArray<Route<T, R, C>> | Route<T, R, C>,
    { baseUrl = '', context, errorHandler, resolveRoute = defaultResolveRoute }: ResolverOptions<T, R, C> = {},
  ) {
    if (Object(routes) !== routes) {
      throw new TypeError('Invalid routes');
    }

    this.baseUrl = baseUrl;
    this.errorHandler = errorHandler;
    this.resolveRoute = resolveRoute;

    if (Array.isArray(routes)) {
      // @FIXME: We should have a route array instead of a single route object
      // to avoid type clash because of a missing `R` part of a route.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.#root = {
        __children: routes,
        __synthetic: true,
        action: () => undefined,
        path: '',
      } as Route<T, R, C>;
    } else {
      this.#root = { ...routes, parent: undefined };
    }

    this.#context = {
      ...context!,
      hash: '',
      // eslint-disable-next-line @typescript-eslint/require-await
      async next() {
        return notFoundResult;
      },
      params: {},
      pathname: '',
      resolver: this,
      route: this.#root,
      search: '',
      chain: [],
    };
  }

  /**
   * The root route.
   */
  get root(): Route<T, R, C> {
    return this.#root;
  }

  /**
   * The current route context.
   */
  get context(): RouteContext<T, R, C> {
    return this.#context;
  }

  /**
   * If the baseUrl property is set, transforms the baseUrl and returns the full
   * actual `base` string for using in the `new URL(path, base);` and for
   * prepernding the paths with. The returned base ends with a trailing slash.
   *
   * Otherwise, returns empty string.
   */
  protected get __effectiveBaseUrl(): string {
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
    return [...(this.#root.__children ?? [])];
  }

  /**
   * Removes all existing routes from the routing config.
   *
   * @public
   */
  removeRoutes(): void {
    this.#root.__children = [];
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
  async resolve(pathnameOrContext: ResolveContext<C> | string): Promise<ActionResult<RouteContext<T, R, C>>> {
    const self = this;
    const context: RouteContext<T, R, C> = {
      ...this.#context,
      ...(isString(pathnameOrContext) ? { pathname: pathnameOrContext } : pathnameOrContext),
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      next,
    };
    const match = matchRoute(
      this.#root,
      this.__normalizePathname(context.pathname) ?? context.pathname,
      !!this.baseUrl,
    );
    const resolve = this.resolveRoute;
    let matches: IteratorResult<MatchWithRoute<T, R, C>, undefined> | null = null;
    let nextMatches: IteratorResult<MatchWithRoute<T, R, C>, undefined> | null = null;
    let currentContext = context;

    async function next(
      resume: boolean = false,
      parent: Route<T, R, C> | undefined = matches?.value?.route,
      prevResult?: ActionResult<T | RouteContext<T, R, C>>,
    ): Promise<ActionResult<RouteContext<T, R, C>>> {
      const routeToSkip = prevResult === null ? matches?.value?.route : undefined;
      matches = nextMatches ?? match.next(routeToSkip);
      nextMatches = null;

      if (!resume) {
        if (!!matches.done || !isDescendantRoute(matches.value.route, parent)) {
          nextMatches = matches;
          return notFoundResult;
        }
      }

      if (matches.done) {
        throw getNotFoundError(context);
      }

      currentContext = {
        ...context,
        params: matches.value.params,
        route: matches.value.route,
        chain: currentContext.chain?.slice(),
      };
      updateChainForRoute(currentContext, matches.value);

      const resolution = await resolve(currentContext);

      if (resolution !== null && resolution !== undefined && resolution !== notFoundResult) {
        currentContext.result = isRouteContext<T, R, C>(resolution) ? resolution.result : resolution;
        self.#context = currentContext;
        return currentContext;
      }
      return await next(resume, parent, resolution);
    }

    try {
      return await next(true, this.#root);
    } catch (error: unknown) {
      const _error =
        error instanceof NotFoundError
          ? error
          : new ResolutionError(currentContext as RouteContext<R>, { code: 500 });

      if (this.errorHandler) {
        currentContext.result = this.errorHandler(_error);
        return currentContext;
      }
      throw error;
    }
  }

  /**
   * Sets the routing config (replacing the existing one).
   *
   * @param routes - a single route or an array of those
   *    (the array is shallow copied)
   */
  setRoutes(routes: ReadonlyArray<Route<T, R, C>> | Route<T, R, C>): object {
    this.#root.__children = [...toArray(routes)];
    return {};
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
    this.#root.__children = [...(this.#root.__children ?? []), ...toArray(routes)];
    return this.getRoutes();
  }
}

export default Resolver;

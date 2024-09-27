/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { parse, type ParseOptions, type Token, tokensToFunction, type TokensToFunctionOptions } from 'path-to-regexp';
import type { EmptyObject, Writable } from 'type-fest';
import Resolver from './resolver.js';
import type { AnyObject, ChildrenCallback, Route } from './types.js';
import { getRoutePath, isString } from './utils.js';

export type UrlParams = Readonly<Record<string, ReadonlyArray<number | string> | number | string>>;

function cacheRoutes<T, R extends AnyObject = EmptyObject>(
  routesByName: Map<string, Array<Route<T, R>>>,
  route: Writable<Route<T, R>>,
  routes?: ChildrenCallback<T, R> | ReadonlyArray<Route<T, R>>,
  cacheKeyProvider?: (route: Route<T, R>) => string,
): void {
  const name = route.name ?? cacheKeyProvider?.(route);
  if (name) {
    if (routesByName.has(name)) {
      routesByName.get(name)?.push(route);
    } else {
      routesByName.set(name, [route]);
    }
  }

  if (Array.isArray<ReadonlyArray<Writable<Route<T, R>>>>(routes)) {
    for (const childRoute of routes) {
      childRoute.parent = route;
      cacheRoutes(routesByName, childRoute, childRoute.__children ?? childRoute.children);
    }
  }
}

function getRouteByName<R extends AnyObject = EmptyObject>(
  routesByName: Map<string, Array<Route<T, R>>>,
  routeName: string,
): Route<T, R> | undefined {
  const routes = routesByName.get(routeName);

  if (routes) {
    if (routes.length > 1) {
      throw new Error(`Duplicate route with name "${routeName}".` + ` Try seting unique 'name' route properties.`);
    }

    return routes[0];
  }

  return undefined;
}

export type StringifyQueryParams = (params: UrlParams) => string;

export type GenerateUrlOptions<T, R extends AnyObject> = ParseOptions &
  Readonly<{
    /**
     * Add a query string to generated url based on unknown route params.
     */
    stringifyQueryParams?: StringifyQueryParams;
    /**
     * Generates a unique route name based on all parent routes with the specified separator.
     */
    uniqueRouteNameSep?: string;
    cacheKeyProvider?(route: Route<T, R>): string;
  }> &
  TokensToFunctionOptions;

type RouteCacheRecord = Readonly<{
  keys: Record<string, true>;
  tokens: Token[];
}>;

export type UrlGenerator = (routeName: string, params?: Params) => string;

function generateUrls<T, R extends AnyObject = EmptyObject>(
  resolver: Resolver<R>,
  options: GenerateUrlOptions<T, R> = { encode: encodeURIComponent },
): UrlGenerator {
  if (!(resolver instanceof Resolver)) {
    throw new TypeError('An instance of Resolver is expected');
  }

  const cache = new Map<string, RouteCacheRecord>();
  const routesByName = new Map<string, Array<Route<T, R>>>();

  return (routeName, params) => {
    let route = getRouteByName(routesByName, routeName);
    if (!route) {
      routesByName.clear(); // clear cache
      cacheRoutes(
        routesByName,
        resolver.root as Writable<Route<T, R>>,
        resolver.root.__children,
        options.cacheKeyProvider,
      );

      route = getRouteByName(routesByName, routeName);
      if (!route) {
        throw new Error(`Route "${routeName}" not found`);
      }
    }

    let cached: RouteCacheRecord | undefined = route.fullPath ? cache.get(route.fullPath) : undefined;
    if (!cached) {
      let fullPath = getRoutePath(route);
      let rt = route.parent;
      while (rt) {
        const path = getRoutePath(rt);
        if (path) {
          fullPath = `${path.replace(/\/$/u, '')}/${fullPath.replace(/^\//u, '')}`;
        }
        rt = rt.parent;
      }
      const tokens = parse(fullPath);
      const keys: Record<string, true> = Object.create(null);
      for (const item of tokens) {
        if (!isString(item)) {
          keys[item.name] = true;
        }
      }
      cached = { keys, tokens };
      cache.set(fullPath, cached);
      route.fullPath = fullPath;
    }

    const toPath = tokensToFunction(cached.tokens, options);
    let url = toPath(params) || '/';

    if (options.stringifyQueryParams && params) {
      const queryParams: Record<string, string | readonly string[]> = {};
      for (const [key, value] of Object.entries(params)) {
        if (!(key in cached.keys) && value) {
          queryParams[key] = value;
        }
      }
      const query = options.stringifyQueryParams(queryParams);
      if (query) {
        url += query.startsWith('?') ? query : `?${query}`;
      }
    }

    return url;
  };
}

export default generateUrls;
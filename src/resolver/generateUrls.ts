/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { parse, type ParseOptions, type Token, tokensToFunction, type TokensToFunctionOptions } from 'path-to-regexp';
import type { EmptyObject } from 'type-fest';
import type { InternalRoute } from '../internal.js';
import type { ChildrenCallback, AnyObject, Params } from '../types.js';
import { getRoutePath, isString } from '../utils.js';
import Resolver from './resolver.js';

export type UrlParams = Readonly<Record<string, ReadonlyArray<number | string> | number | string>>;

function cacheRoutes<R extends AnyObject = EmptyObject>(
  routesByName: Map<string, Array<InternalRoute<R>>>,
  route: InternalRoute<R>,
  routes?: ChildrenCallback<R> | ReadonlyArray<InternalRoute<R>>,
): void {
  const name = route.name ?? route.component;
  if (name) {
    if (routesByName.has(name)) {
      routesByName.get(name)?.push(route);
    } else {
      routesByName.set(name, [route]);
    }
  }

  if (Array.isArray<ReadonlyArray<InternalRoute<R>>>(routes)) {
    for (const childRoute of routes) {
      childRoute.parent = route;
      cacheRoutes(routesByName, childRoute, childRoute.__children ?? childRoute.children);
    }
  }
}

function getRouteByName<R extends AnyObject = EmptyObject>(
  routesByName: Map<string, Array<InternalRoute<R>>>,
  routeName: string,
): InternalRoute<R> | undefined {
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

export type GenerateUrlOptions = ParseOptions &
  Readonly<{
    /**
     * Add a query string to generated url based on unknown route params.
     */
    stringifyQueryParams?: StringifyQueryParams;
    /**
     * Generates a unique route name based on all parent routes with the specified separator.
     */
    uniqueRouteNameSep?: string;
  }> &
  TokensToFunctionOptions;

type RouteCacheRecord = Readonly<{
  keys: Record<string, true>;
  tokens: Token[];
}>;

export type UrlGenerator = (routeName: string, params?: Params) => string;

function generateUrls<R extends AnyObject = EmptyObject>(
  resolver: Resolver<R>,
  options: GenerateUrlOptions = { encode: encodeURIComponent },
): UrlGenerator {
  if (!(resolver instanceof Resolver)) {
    throw new TypeError('An instance of Resolver is expected');
  }

  const cache = new Map<string, RouteCacheRecord>();
  const routesByName = new Map<string, Array<InternalRoute<R>>>();

  return (routeName, params) => {
    let route = getRouteByName(routesByName, routeName);
    if (!route) {
      routesByName.clear(); // clear cache
      cacheRoutes(routesByName, resolver.root, resolver.root.__children);

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

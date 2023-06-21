/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {parse, tokensToFunction, type Token, type Key} from 'path-to-regexp';
import Resolver from './resolver.js';
import { isString } from '../utils.js';
import type { ChildrenFn, InternalRoute, Route } from '../types/route.js';
import type { Params } from '../types/params.js';

export interface UrlParams {
  [paramName: string]: string | number | (string | number)[];
}

function cacheRoutes(routesByName: Map<string, InternalRoute[]>, route: InternalRoute, routes?: ReadonlyArray<Route> | ChildrenFn): void {
  const name = route.name || route.component;
  if (name) {
    if (routesByName.has(name)) {
      routesByName.get(name)!.push(route);
    } else {
      routesByName.set(name, [route]);
    }
  }

  if (Array.isArray(routes)) {
    for (let i = 0; i < routes.length; i++) {
      const childRoute = routes[i] as InternalRoute;
      childRoute.parent = route;
      cacheRoutes(routesByName, childRoute, childRoute.__children || childRoute.children);
    }
  }
}

function getRouteByName(routesByName: Map<string, Route[]>, routeName: string): InternalRoute | undefined {
  const routes = routesByName.get(routeName);
  if (routes && routes.length > 1) {
    throw new Error(
      `Duplicate route with name "${routeName}".`
      + ` Try seting unique 'name' route properties.`
    );
  }
  return routes && routes[0];
}

function getRoutePath(route: InternalRoute) {
  let path = route.path;
  path = Array.isArray(path) ? path[0] : path;
  return path !== undefined ? path : '';
}

type RouteWithFullPath = Route & {fullPath: string};
type RouteCacheRecord = Readonly<{
  tokens: Token[],
  keys: Record<string, true>;
}>;

function generateUrls(router: Resolver, options: {stringifyQueryParams?: (params: Params) => string} = {}) {
  if (!(router instanceof Resolver)) {
    throw new TypeError('An instance of Resolver is expected');
  }

  const cache: Map<string, RouteCacheRecord> = new Map();
  const routesByName: Map<string, Route[]> = new Map();

  return (routeName: string, params?: Params) => {
    let route = getRouteByName(routesByName, routeName);
    if (!route) {
      routesByName.clear(); // clear cache
      cacheRoutes(routesByName, router.root, router.root.__children);

      route = getRouteByName(routesByName, routeName);
      if (!route) {
        throw new Error(`Route "${routeName}" not found`);
      }
    }

    let cached: RouteCacheRecord | undefined = undefined;
    if ('fullPath' in route) {
      cached = cache.get((route as RouteWithFullPath).fullPath);
    } 
    if (!cached) {
      let fullPath = getRoutePath(route);
      let rt = route.parent;
      while (rt) {
        const path = getRoutePath(rt);
        if (path) {
          fullPath = path.replace(/\/$/, '') + '/' + fullPath.replace(/^\//, '');
        }
        rt = rt.parent;
      }
      const tokens: Token[] = parse(fullPath);
      const keys = Object.create(null as object | null);
      for (let i = 0; i < tokens.length; i++) {
        if (!isString(tokens[i])) {
          keys[(tokens[i] as Key).name] = true;
        }
      }
      cached = {tokens, keys};
      cache.set(fullPath, cached);
      (route as RouteWithFullPath).fullPath = fullPath;
    }

    const toPath = tokensToFunction(cached.tokens, {});
    let url = toPath(params) || '/';

    if (options.stringifyQueryParams && params) {
      const queryParams = {};
      const keys = Object.keys(params);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!cached.keys[key]) {
          type ParamRecord = Record<string, string | string[]>;
          (queryParams as ParamRecord)[key] = (params as ParamRecord)[key];
        }
      }
      const query = options.stringifyQueryParams(queryParams);
      if (query) {
        url += query.charAt(0) === '?' ? query : `?${query}`;
      }
    }

    return url;
  };
}

export default generateUrls;

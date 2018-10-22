/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Resolver from './resolver.js';
import {isString} from '../utils.js';

const {pathToRegexp} = Resolver;
const cache = new Map();

function cacheRoutes(routesByName, route, routes) {
  if (routesByName.has(route.name)) {
    throw new Error(`Duplicate route name for name "${route.name}"`);
  } else if (routesByName.has(route.component)) {
    throw new Error(`Duplicate route name for component <${route.component}>`);
  }

  const name = route.name || route.component;
  if (name) {
    routesByName.set(name, route);
  }

  if (routes) {
    for (let i = 0; i < routes.length; i++) {
      const childRoute = routes[i];
      childRoute.parent = route;
      cacheRoutes(routesByName, childRoute, childRoute.__children || childRoute.children);
    }
  }
}

function generateUrls(router, options = {}) {
  if (!(router instanceof Resolver)) {
    throw new TypeError('An instance of Resolver is expected');
  }

  const routesByName = new Map();

  return (routeName, params) => {
    let route = routesByName.get(routeName);
    if (!route) {
      routesByName.clear(); // clear cache
      cacheRoutes(routesByName, router.root, router.root.__children);

      route = routesByName.get(routeName);
      if (!route) {
        throw new Error(`Route "${routeName}" not found`);
      }
    }

    let regexp = cache.get(route.fullPath);
    if (!regexp) {
      let fullPath = Array.isArray(route.path) ? route.path[0] : route.path;
      let rt = route.parent;
      while (rt) {
        const path = Array.isArray(rt.path) ? rt.path[0] : rt.path;
        if (path) {
          fullPath = path.replace(/\/$/, '') + '/' + fullPath.replace(/^\//, '');
        }
        rt = rt.parent;
      }
      const tokens = pathToRegexp.parse(fullPath);
      const toPath = pathToRegexp.tokensToFunction(tokens);
      const keys = Object.create(null);
      for (let i = 0; i < tokens.length; i++) {
        if (!isString(tokens[i])) {
          keys[tokens[i].name] = true;
        }
      }
      regexp = {toPath, keys};
      cache.set(fullPath, regexp);
      route.fullPath = fullPath;
    }

    let url = router.baseUrl + regexp.toPath(params, options) || '/';

    if (options.stringifyQueryParams && params) {
      const queryParams = {};
      const keys = Object.keys(params);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!regexp.keys[key]) {
          queryParams[key] = params[key];
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

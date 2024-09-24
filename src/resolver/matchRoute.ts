/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import type { Key } from 'path-to-regexp';
import type { InternalRoute } from '../internal.js';
import type { AnyObject, IndexedParams } from '../types.js';
import {getRoutePath, isFunction, unwrapChildren} from '../utils.js';
import matchPath, { type Match } from './matchPath.js';

export type MatchWithRoute<R extends AnyObject> = Match &
  Readonly<{
    route: InternalRoute<R>;
  }>;

type RouteMatchIterator<R extends AnyObject> = Iterator<MatchWithRoute<R>, undefined, InternalRoute<R> | undefined>;

/**
 * Traverses the routes tree and matches its nodes to the given pathname from
 * the root down to the leaves. Each match consumes a part of the pathname and
 * the matching process continues for as long as there is a matching child
 * route for the remaining part of the pathname.
 *
 * The returned value is a lazily evaluated iterator.
 *
 * The leading "/" in a route path matters only for the root of the routes
 * tree (or if all parent routes are ""). In all other cases a leading "/" in
 * a child route path has no significance.
 *
 * The trailing "/" in a _route path_ matters only for the leaves of the
 * routes tree. A leaf route with a trailing "/" matches only a pathname that
 * also has a trailing "/".
 *
 * The trailing "/" in a route path does not affect matching of child routes
 * in any way.
 *
 * The trailing "/" in a _pathname_ generally does not matter (except for
 * the case of leaf nodes described above).
 *
 * The "" and "/" routes have special treatment:
 *  1. as a single route
 *     the "" and "/" routes match only the "" and "/" pathnames respectively
 *  2. as a parent in the routes tree
 *     the "" route matches any pathname without consuming any part of it
 *     the "/" route matches any absolute pathname consuming its leading "/"
 *  3. as a leaf in the routes tree
 *     the "" and "/" routes match only if the entire pathname is consumed by
 *         the parent routes chain. In this case "" and "/" are equivalent.
 *  4. several directly nested "" or "/" routes
 *     - directly nested "" or "/" routes are 'squashed' (i.e. nesting two
 *       "/" routes does not require a double "/" in the pathname to match)
 *     - if there are only "" in the parent routes chain, no part of the
 *       pathname is consumed, and the leading "/" in the child routes' paths
 *       remains significant
 *
 * Side effect:
 *   - the routes tree `{ path: '' }` matches only the '' pathname
 *   - the routes tree `{ path: '', children: [ { path: '' } ] }` matches any
 *     pathname (for the tree root)
 *
 * Prefix matching can be enabled also by `children: true`.
 */
// eslint-disable-next-line @typescript-eslint/max-params
function matchRoute<R extends AnyObject>(
  route: InternalRoute<R>,
  pathname: string,
  ignoreLeadingSlash?: boolean,
  parentKeys?: readonly Key[],
  parentParams?: IndexedParams,
): Iterator<MatchWithRoute<R>, undefined, InternalRoute<R> | undefined> {
  let match: Match | null;
  let childMatches: RouteMatchIterator<R> | null;
  let childIndex = 0;
  let routepath = getRoutePath(route);
  if (routepath.startsWith('/')) {
    if (ignoreLeadingSlash) {
      routepath = routepath.substring(1);
    }
    // eslint-disable-next-line no-param-reassign
    ignoreLeadingSlash = true;
  }

  return {
    next: function (routeToSkip?: InternalRoute<R>): IteratorResult<MatchWithRoute<R>, undefined> {
      if (route === routeToSkip) {
        return { done: true, value: undefined };
      }

      route.__children ??= unwrapChildren(route.children);
      const children = route.__children ?? [];
      const exact = !route.__children && !route.children;

      if (!match) {
        match = matchPath(routepath, pathname, exact, parentKeys, parentParams);

        if (match) {
          return {
            value: {
              keys: match.keys,
              params: match.params,
              path: match.path,
              route,
            },
          };
        }
      }

      if (match && children.length > 0) {
        while (childIndex < children.length) {
          if (!childMatches) {
            const childRoute = children[childIndex];
            childRoute.parent = route;

            let matchedLength = match.path.length;
            if (matchedLength > 0 && pathname.charAt(matchedLength) === '/') {
              matchedLength += 1;
            }

            childMatches = matchRoute(
              childRoute,
              pathname.substring(matchedLength),
              ignoreLeadingSlash,
              match.keys,
              match.params,
            );
          }

          const childMatch = childMatches.next(routeToSkip);
          if (!childMatch.done) {
            return {
              done: false,
              value: childMatch.value,
            };
          }

          childMatches = null;
          childIndex += 1;
        }
      }

      return { done: true, value: undefined };
    },
  };
}

export default matchRoute;

/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import matchPath from './matchPath.js'

function matchRoute(route, pathname, parentKeys, parentParams) {
  let match
  let childMatches
  let childIndex = 0
  let routepath = route.path
  if (route.parent && routepath.charAt(0) === '/') {
    routepath = routepath.substr(1, routepath.length - 1)
  } 

  return {
    next(routeToSkip) {
      if (route === routeToSkip) {
        return { done: true }
      }

      if (!match) {
        match = matchPath(routepath, pathname, route.exact, parentKeys, parentParams)

        if (match) {
          return {
            done: false,
            value: {
              route,
              keys: match.keys,
              params: match.params,
            },
          }
        }
        else if (route.exact) {
          match = matchPath(routepath, pathname, false, parentKeys, parentParams)
        }
      }

      if (match && route.children) {        
        while (childIndex < route.children.length) {
          if (!childMatches) {
            const childRoute = route.children[childIndex]
            childRoute.parent = route

            let matchedPath = match.path;
            if (matchedPath.charAt(matchedPath.length - 1) !== '/'
                && !(route.path === '' && (childRoute.path || '').charAt(0) !== '/')) {
              matchedPath += '/'
            }

            childMatches = matchRoute(
              childRoute,
              pathname.substr(matchedPath.length),
              match.keys,
              match.params,
            )
          }

          const childMatch = childMatches.next(routeToSkip)
          if (!childMatch.done) {
            return {
              done: false,
              value: childMatch.value,
            }
          }

          childMatches = null
          childIndex++
        }
      }

      return { done: true }
    },
  }
}

export default matchRoute

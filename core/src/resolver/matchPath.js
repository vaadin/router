/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import pathToRegexp from './path-to-regexp.js'

const { hasOwnProperty } = Object.prototype
const cache = new Map()
// see https://github.com/pillarjs/path-to-regexp/issues/148
cache.set('|false', {
  keys: [],
  pattern: /(?:)/
})

function decodeParam(val) {
  try {
    return decodeURIComponent(val)
  } catch (err) {
    return val
  }
}

function matchPath(route, pathname, parentKeys, parentParams) {
  const routepath = (route.path || '')
  const end = !!route.exact
  const cacheKey = `${routepath}|${end}`
  let regexp = cache.get(cacheKey)

  if (!regexp) {
    const keys = []
    regexp = {
      keys,
      pattern: pathToRegexp(routepath, keys, { end, strict: routepath === '' }),
    }
    cache.set(cacheKey, regexp)
  }

  const m = regexp.pattern.exec(pathname)
  if (!m) {
    return null
  }

  const path = m[0]
  const params = Object.assign({}, parentParams)

  for (let i = 1; i < m.length; i++) {
    const key = regexp.keys[i - 1]
    const prop = key.name
    const value = m[i]
    if (value !== undefined || !hasOwnProperty.call(params, prop)) {
      if (key.repeat) {
        params[prop] = value ? value.split(key.delimiter).map(decodeParam) : []
      } else {
        params[prop] = value ? decodeParam(value) : value
      }
    }
  }

  return {
    path: path,
    keys: (parentKeys || []).concat(regexp.keys),
    params,
  }
}

export default matchPath

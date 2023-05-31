/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {pathToRegexp, type Key} from 'path-to-regexp';
import type {Params} from "../types/params";

type Matcher = Readonly<{
  keys: ReadonlyArray<Key>,
  pattern: RegExp,
}>;

const {hasOwnProperty} = Object.prototype;
const cache: Map<string, Matcher> = new Map();
// see https://github.com/pillarjs/path-to-regexp/issues/148
cache.set('|false', {
  keys: [],
  pattern: /(?:)/
});

function decodeParam(val: string): string {
  try {
    return decodeURIComponent(val);
  } catch (err) {
    return val;
  }
}

function matchPath(routepath: string, path: string, exact?: boolean, parentKeys?: ReadonlyArray<Key>, parentParams?: Params) {
  exact = !!exact;
  const cacheKey = `${routepath}|${exact}`;
  let regexp = cache.get(cacheKey);

  if (!regexp) {
    const keys = [];
    regexp = {
      keys,
      pattern: pathToRegexp(routepath, keys, {
        end: exact,
        strict: routepath === ''
      }),
    };
    cache.set(cacheKey, regexp);
  }

  const m = regexp.pattern.exec(path);
  if (!m) {
    return null;
  }

  const params = Object.assign({}, parentParams);

  for (let i = 1; i < m.length; i++) {
    const key = regexp.keys[i - 1];
    const prop = key.name;
    const value = m[i];
    if (value !== undefined || !hasOwnProperty.call(params, prop)) {
      if (key.modifier === '+' || key.modifier === '*') {
        // by default, as of path-to-regexp 6.0.0, the default delimiters
        // are `/`, `#` and `?`.
        params[prop] = value ? value.split(/[/?#]/).map(decodeParam) : [];
      } else {
        params[prop] = value ? decodeParam(value) : value;
      }
    }
  }

  return {
    path: m[0],
    keys: (parentKeys || []).concat(regexp.keys),
    params,
  };
}

export default matchPath;

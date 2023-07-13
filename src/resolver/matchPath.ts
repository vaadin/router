/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { type Key, pathToRegexp } from 'path-to-regexp';
import type { Writable } from 'type-fest';
import type { RegExpExecOptArray } from '../internal.js';
import type { IndexedParams } from '../types.js';
import { resolvePath } from '../utils.js';

type Matcher = Readonly<{
  keys: readonly Key[];
  pattern: RegExp;
}>;

export type Match = Readonly<{
  path: string;
  keys: readonly Key[];
  params: IndexedParams;
}>;

const cache = new Map<string, Matcher>();
// see https://github.com/pillarjs/path-to-regexp/issues/148
cache.set('|false', {
  keys: [],
  pattern: /(?:)/u,
});

function decodeParam(val: string): string {
  try {
    return decodeURIComponent(val);
  } catch (err) {
    return val;
  }
}

function matchPath(
  routepath: string,
  path: string[] | string,
  exact: boolean = false,
  parentKeys: readonly Key[] = [],
  parentParams?: IndexedParams,
): Match | null {
  const cacheKey = `${routepath}|${String(exact)}`;
  const _path = resolvePath(path);
  let regexp = cache.get(cacheKey);

  if (!regexp) {
    const keys: Key[] = [];
    regexp = {
      keys,
      pattern: pathToRegexp(routepath, keys, {
        end: exact,
        strict: routepath === '',
      }),
    };
    cache.set(cacheKey, regexp);
  }

  const m: RegExpExecOptArray | null = regexp.pattern.exec(_path);
  if (!m) {
    return null;
  }

  const params: Writable<IndexedParams> = { ...parentParams };

  for (let i = 1; i < m.length; i++) {
    const key = regexp.keys[i - 1];
    const prop = key.name;
    const value = m[i];
    if (value !== undefined || !Object.hasOwn(params, prop)) {
      if (key.modifier === '+' || key.modifier === '*') {
        // by default, as of path-to-regexp 6.0.0, the default delimiters
        // are `/`, `#` and `?`.
        params[prop] = value ? value.split(/[/?#]/u).map(decodeParam) : [];
      } else {
        params[prop] = value ? decodeParam(value) : value;
      }
    }
  }

  return {
    keys: [...parentKeys, ...regexp.keys],
    params,
    path: m[0],
  };
}

export default matchPath;

/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import type { EmptyObject } from 'type-fest';
import type { ActionResult, AnyObject, MaybePromise, RouteContext } from '../types.js';
import { isFunction } from '../utils.js';

export default function resolveRoute<R extends AnyObject = EmptyObject>(
  context: RouteContext<R>,
): MaybePromise<ActionResult> {
  if (isFunction(context.route.action)) {
    return context.route.action(context);
  }
  return undefined;
}

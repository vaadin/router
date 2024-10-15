/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import type { ActionResult, MaybePromise, RouteContext } from './types.js';
import { isFunction } from './utils.js';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export default function resolveRoute<T, R extends object, C extends object>(
  context: RouteContext<T, R, C>,
): MaybePromise<ActionResult<T | RouteContext<T, R, C>>> {
  if (isFunction(context.route.action)) {
    // @ts-expect-error: ignore "never" type here
    return context.route.action(context);
  }
  return undefined;
}

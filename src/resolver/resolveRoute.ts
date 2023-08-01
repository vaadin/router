/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import type { ActionResult, EmptyRecord, RouteContext } from '../types.js';
import { isFunction } from '../utils.js';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export default async function resolveRoute<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
>(context: RouteContext<T, R, C>): Promise<ActionResult<T>> {
  if (isFunction(context.route.action)) {
    return context.route.action(context);
  }
  return undefined;
}

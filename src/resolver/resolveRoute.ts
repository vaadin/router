/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {isFunction, ResolveResult} from '../utils.js';
import {ActionResult, Context} from "../types/route";

function resolveRoute(context: Context): ResolveResult | Promise<ResolveResult> {
  if (isFunction(context.route.action)) {
    return context.route.action(context);
  }
  return undefined;
}

export default resolveRoute;

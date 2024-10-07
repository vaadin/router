import type { AnyObject, RouterContext as _RouterContext } from '@ausginer/router';
import type { ActionValue } from '../types/general.js';
import type { RouteContext } from '../types/RouteContext.js';

export function context<R extends AnyObject, C extends AnyObject>(
  ctx: _RouterContext<ActionValue, R, C>,
): RouteContext<R, C> {
  return;
}

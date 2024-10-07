import type { AnyObject } from '@ausginer/router';
import type { ActionResult, ActionValue, MaybePromise, Result } from './general.js';
import type { RouteContext } from './RouteContext.js';

export type ErrorHandlerCallback = (error: unknown) => ActionResult;

export type ResolveRouteCallback<R extends AnyObject, C extends AnyObject> = (
  context: RouteContext<R, C>,
) => MaybePromise<Result<ActionValue | RouteContext<R, C>>>;

export type RouterOptions<R extends AnyObject, C extends AnyObject> = Readonly<{
  baseUrl?: string;
  context?: RouteContext<R, C>;
  errorHandler?: ErrorHandlerCallback;
  resolveRoute?: ResolveRouteCallback<R, C>;
}>;

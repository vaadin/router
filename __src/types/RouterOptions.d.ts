import type { MaybePromise } from '@ausginer/router';
import type { ActionResult } from './general.js';
import type { RouteContext } from './RouteContext.js';

export type ErrorHandlerCallback = (error: unknown) => ActionResult;

export type ResolveRouteCallback<R extends object, C extends object> = (
  context: RouteContext<R, C>,
) => MaybePromise<ActionResult | RouteContext<R, C>>;

export type RouterOptions<R extends object, C extends object> = Readonly<{
  baseUrl?: string;
  context?: RouteContext<R, C>;
  errorHandler?: ErrorHandlerCallback;
  resolveRoute?: ResolveRouteCallback<R, C>;
}>;

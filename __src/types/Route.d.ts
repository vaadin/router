import type { MaybePromise, Route as _Route } from '@ausginer/router';
import type { EmptyObject, RequireAtLeastOne } from 'type-fest';
import type { Commands, PreventCommand, RedirectCommand } from '../internals/Commands.js';
import type { ActionResult, InternalResult } from './general.js';
import type { RouteContext } from './RouteContext.js';

export type AnimateCustomClasses = Readonly<{
  enter?: string;
  leave?: string;
}>;

export type Route<R extends object = EmptyObject, C extends object = EmptyObject> = Readonly<
  RequireAtLeastOne<{
    children?: ReadonlyArray<Route<R, C>>;
    component?: string;
    redirect?: string;
    action?(this: Route<R, C>, context: RouteContext<R, C>, commands: Commands): MaybePromise<ActionResult>;
  }>
> &
  Readonly<{
    name?: string;
    path: string;
    parent?: Route<R, C>;
    fullPath?: string;
    animate?: AnimateCustomClasses | boolean;
  }> &
  R;

export type InternalRoute<R extends object, C extends object> = _Route<
  ReadonlyArray<InternalResult<R, C>> | RedirectCommand | PreventCommand,
  R,
  C
>;

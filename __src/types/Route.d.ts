import type { AnyObject } from '@ausginer/router';
import type { EmptyObject, RequireAtLeastOne } from 'type-fest';
import type { Commands } from './Commands.js';
import type { ActionResult, MaybePromise } from './general.js';
import type { RouteContext } from './RouteContext.js';

export type AnimateCustomClasses = Readonly<{
  enter?: string;
  leave?: string;
}>;

export type Route<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = Readonly<
  RequireAtLeastOne<{
    children?: ReadonlyArray<Route<R, C>>;
    component?: string;
    redirect?: string;
    action?(
      this: Route<R, C>,
      context: RouteContext<R, C>,
      commands: Commands,
    ): MaybePromise<ActionResult | RouteContext<R, C>>;
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

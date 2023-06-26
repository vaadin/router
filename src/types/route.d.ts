import type { RequireAtLeastOne } from 'type-fest';
import type { IndexedParams } from './params.js';

export type NotFoundResult = Readonly<{
  // Prevent treating any object literals `{}` as a match for this type
  _notFoundResultBrand: never;
}>;

export type ComponentResult = Readonly<{
  _componentResultBrand: never;
}>;

export type PreventResult = Readonly<{
  _preventResultBrand: never;
}>;

export type RedirectResult = Readonly<{
  _redirectResultBrand: never;
}>;

export type ActionResult =
  | void
  | null
  | HTMLElement
  | NotFoundResult
  | ComponentResult
  | RedirectResult
  | PreventResult;

export type Context = Readonly<{
  pathname: string;
  search: string;
  hash: string;
  params: IndexedParams;
  route: Route;
  next: () => Promise<ActionResult>;
}>;

export type Commands = Readonly<{
  component: (name: string) => ComponentResult;
  redirect: (path: string) => RedirectResult;

  /**
   * function that creates a special object that can be returned to abort
   * the current navigation and fall back to the last one. If there is no
   * existing one, an exception is thrown.
   */
  prevent: () => PreventResult;
}>;

export type ActionFn = (context: Context, commands: Commands) => ActionResult | Promise<ActionResult>;

export type ChildrenFn = (context: Omit<Context, 'next'>) => Route[] | Promise<Route[]>;

type Route = Readonly<{
  path: string;
  name?: string;
}> &
  Readonly<
    RequireAtLeastOne<{
      action?: ActionFn;
      children?: Route[] | ChildrenFn;
      component?: string;
      redirect?: string;
    }>
  >;

type AnimateCustomClasses = Readonly<{
  enter?: string;
  leave?: string;
}>;

export type AnimatableRoute = Route &
  Readonly<{
    animate?: boolean | AnimateCustomClasses;
  }>;

export type InternalRoute = AnimatableRoute & {
  parent?: InternalRoute;
  __children?: InternalRoute[];
  __synthetic?: true;
};

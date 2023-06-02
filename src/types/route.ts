import type {IndexedParams} from "./params.js";

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

export type ActionResult = void
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

type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

type BaseRoute = {
  path: string;
  name?: string;
  // Route requires at least one of the following optional properties
  action?: ActionFn;
  children?: Route[] | ChildrenFn;
  component?: string;
  redirect?: string;
};

type AnimateCustomClasses = {
  enter?: string;
  leave?: string;
};

type AnimatableRoute = BaseRoute & {
  animate?: boolean | AnimateCustomClasses;
};

type RouteWithAction = MakeRequired<BaseRoute, 'action'>;
type RouteWithChildren = MakeRequired<AnimatableRoute, 'children'>;
type RouteWithComponent = MakeRequired<AnimatableRoute, 'component'>;
type RouteWithRedirect = MakeRequired<BaseRoute, 'redirect'>;

export type Route = RouteWithAction
  | RouteWithChildren
  | RouteWithComponent
  | RouteWithRedirect

export type InternalRoute = BaseRoute & {
  animate?: boolean | AnimateCustomClasses;
  parent?: InternalRoute;
  __children?: Route[];
  __synthetic?: true;
}

/// <reference lib="DOM" />

// NOTE(platosha): The main TypeScript declarations are auto-generated
// in `dist/vaadin-router.d.ts` from JSdoc annotations during the build.
// This file is supplemental, it only covers the types missing from
// the generated declarations.

declare class Router {
}

declare namespace Router {
  class NotFoundResult {
    // Prevent instantiation and extension
    private constructor();

    // Prevent treating any object literals `{}` as a match for this type
    private _notFoundResultBrand: never;
  }

  class ComponentResult {
    private constructor();
    private _componentResultBrand: never;
  }

  class PreventResult {
    private constructor();
    private _preventResultBrand: never; 
  }

  class RedirectResult {
    private constructor();
    private _redirectResultBrand: never;
  }

  type ActionResult = void
    | null
    | HTMLElement
    | NotFoundResult
    | ComponentResult
    | RedirectResult
    | PreventResult;

  type ParamValue = string | string[];
  type IndexedParams = {[key in string | number]: ParamValue};
  type Params = IndexedParams | ParamValue[];

  class Context {
    pathname: string;
    search: string;
    hash: string;
    params: IndexedParams;
    route: Route;
    next: () => Promise<ActionResult>;
  }

  class Commands {
    component: (name: string) => ComponentResult;
    redirect: (path: string) => RedirectResult;
    prevent: () => PreventResult;
  }

  interface ActionFn {
    (context: Context, commmands: Commands): ActionResult | Promise<ActionResult>;
  }

  interface ChildrenFn {
    (): Route[] | Promise<Route[]>
  }

  interface BaseRoute {
    path: string;
    name?: string;
    // Route requires at least one of the following optional properties
    action?: ActionFn;
    bundle?: string;
    children?: Route[] | ChildrenFn;
    component?: string;
    redirect?: string;
  }
  interface RouteWithAction extends BaseRoute {
    action: ActionFn;
  }
  interface RouteWithBundle extends BaseRoute {
    bundle: string;
  }
  interface RouteWithChildren extends BaseRoute {
    children: Route[] | ChildrenFn;
  }
  interface RouteWithComponent extends BaseRoute {
    component: string;
  }
  interface RouteWithRedirect extends BaseRoute {
    redirect: string;
  }
  type Route = RouteWithAction
    | RouteWithBundle
    | RouteWithChildren
    | RouteWithComponent
    | RouteWithRedirect;

  class Location {
    baseUrl: string;
    params: IndexedParams;
    pathname: string;
    search: string;
    hash: string;
    redirectFrom?: string;
    route: Route | null;
    routes: Array<Route>;
    getUrl(params?: Params): string;
  }

  interface Options {
    baseUrl?: string;
  }

  interface NavigationTrigger {
    activate(): void;
    inactivate(): void;
  }

  // FIXME(platosha): declare builtin navigation triggers
  // // Alias for referencing interface from the class below
  // type _NavigationTrigger = NavigationTrigger;
  // namespace NavigationTrigger {
  //   const CLICK: _NavigationTrigger;
  //   const POPSTATE: _NavigationTrigger;
  // }
}

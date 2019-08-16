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

  class Context {
    pathname: string;
    search: string;
    hash: string;
    params: object;
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

  interface Route {
    path: string;
    children?: Route[] | ChildrenFn
    action?: ActionFn;
    redirect?: string;
    bundle?: string;
    component?: string;
    name?: string;
  }

  class Location {
    baseUrl: string;
    params: object;
    pathname: string;
    redirectFrom?: string;
    route: Route | null;
    routes: Array<Route>;
    getUrl(params?: any): string;
  }

  interface Options {
    baseUrl?: string;
  }

  interface NavigationTrigger {
    activate(): void;
    inactivate(): void;
  }

  export class Foo {}

  // // Alias for referencing interface from the class below
  // type _NavigationTrigger = NavigationTrigger;

  // export namespace NavigationTrigger {
  //   export const CLICK: _NavigationTrigger;
  //   export const POPSTATE: _NavigationTrigger;
  // }
}

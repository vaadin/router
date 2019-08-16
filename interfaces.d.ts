/// <reference lib="DOM" />

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
    params: any;
    route: Route;
    next: () => Promise<ActionResult>;
  }

  class Commands {
    component: (name: string) => ComponentResult;
    redirect: (path: string) => RedirectResult;
    prevent: () => PreventResult;
  }

  interface Action {
    (context: Context, commmands: Commands): ActionResult | Promise<ActionResult>;
  }

  interface Route {
    path: string;
    children?: Route[];
    action?: Action;
    redirect?: string;
    bundle?: string;
    component?: string;
    name?: string;
  }

  class Location {
    baseUrl: string;
    params: any | null;
    pathname: string | null;
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
}

/// <reference lib="DOM" />

// NOTE(platosha): The main TypeScript declarations are auto-generated
// in `dist/vaadin-router.d.ts` from JSdoc annotations during the build.
// This file is supplemental, it only covers the types missing from
// the generated declarations.

import {Router} from './dist/vaadin-router';

declare module './dist/vaadin-router' {
  namespace Router {
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

    namespace NavigationTrigger {
      const CLICK: NavigationTrigger;
      const POPSTATE: NavigationTrigger;
    }
  }

  export type RouterLocation = Router.Location;

  export class PreventAndRedirectCommands {
    redirect: (path: string) => Router.RedirectResult;
    prevent: () => Router.PreventResult;
  }

  export class PreventCommands {
    prevent: () => Router.PreventResult;
  }

  export class EmptyCommands {
  }

  export interface BeforeEnterObserver {
    onBeforeEnter: (
      location: RouterLocation,
      commands: PreventAndRedirectCommands,
      router: Router
    ) => void
      | Router.PreventResult
      | Router.RedirectResult
      | Promise<void
        | Router.PreventResult
        | Router.RedirectResult>;
  }

  export interface BeforeLeaveObserver {
    onBeforeLeave: (
      location: RouterLocation,
      commands: PreventCommands,
      router: Router
    ) => void
      | Router.PreventResult
      | Promise<void
        | Router.PreventResult>;
  }

  export interface AfterEnterObserver {
    onAfterEnter: (
      location: RouterLocation,
      commands: EmptyCommands,
      router: Router
    ) => void;
  }

  export interface AfterLeaveObserver {
    onAfterLeave: (
      location: RouterLocation,
      commands: EmptyCommands,
      router: Router
    ) => void;
  }
}

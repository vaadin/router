/// <reference lib="DOM" />

// NOTE(platosha): The main TypeScript declarations are auto-generated
// in `dist/vaadin-router.d.ts` from JSdoc annotations during the build.
// This file is supplemental, it only covers the types missing from
// the generated declarations.

import {Router, RouterLocation} from './dist/vaadin-router';

declare global {
  interface WindowEventMap {
    'vaadin-router-location-changed': CustomEvent<{
      router: Router;
      location: RouterLocation;
    }>;
  }
}

declare module './dist/vaadin-router' {
  export class NotFoundResult {
    // Prevent instantiation and extension
    private constructor();

    // Prevent treating any object literals `{}` as a match for this type
    private _notFoundResultBrand: never;
  }
  type _NotFoundResult = NotFoundResult;

  export class ComponentResult {
    private constructor();

    private _componentResultBrand: never;
  }
  type _ComponentResult = ComponentResult;

  export class PreventResult {
    private constructor();

    private _preventResultBrand: never;
  }
  type _PreventResult = PreventResult;

  export class RedirectResult {
    private constructor();

    private _redirectResultBrand: never;
  }
  type _RedirectResult = RedirectResult;

  export type ActionResult = void
    | null
    | HTMLElement
    | NotFoundResult
    | ComponentResult
    | RedirectResult
    | PreventResult;
  type _ActionResult = ActionResult;

  type ParamValue = string | string[];
  export type IndexedParams = { [key in string | number]: ParamValue };
  type _IndexedParams = IndexedParams;
  export type Params = IndexedParams | ParamValue[];
  type _Params = Params;

  export class Context {
    private constructor();

    pathname: string;
    search: string;
    hash: string;
    params: IndexedParams;
    route: Route;
    next: () => Promise<ActionResult>;
  }
  type _Context = Context;

  export class Commands {
    private constructor();

    component: (name: string) => ComponentResult;
    redirect: (path: string) => RedirectResult;
    prevent: () => PreventResult;
  }
  type _Commands = Commands;

  export interface ActionFn {
    (context: Context, commands: Commands): ActionResult | Promise<ActionResult>;
  }
  type _ActionFn = ActionFn;

  export interface ChildrenFn {
    (): Route[] | Promise<Route[]>
  }
  type _ChildrenFn = ChildrenFn;

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

  interface AnimateCustomClasses {
    enter?: string;
    leave?: string;
  }

  interface AnimatableRoute extends BaseRoute {
    animate?: boolean | AnimateCustomClasses;
  }

  interface RouteWithAction extends BaseRoute {
    action: ActionFn;
  }

  interface RouteWithBundle extends BaseRoute {
    bundle: string;
  }

  interface RouteWithChildren extends AnimatableRoute {
    children: Route[] | ChildrenFn;
  }

  interface RouteWithComponent extends AnimatableRoute {
    component: string;
  }

  interface RouteWithRedirect extends BaseRoute {
    redirect: string;
  }

  export type Route = RouteWithAction
    | RouteWithBundle
    | RouteWithChildren
    | RouteWithComponent
    | RouteWithRedirect
  type _Route = Route;

  export interface RouterOptions {
    baseUrl?: string;
  }
  type _RouterOptions = RouterOptions;

  export class RouterLocation {
    private constructor();

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
  type _RouterLocation = RouterLocation;

  export class PreventAndRedirectCommands {
    redirect: (path: string) => Router.RedirectResult;
    prevent: () => Router.PreventResult;
  }
  type _PreventAndRedirectCommands = PreventAndRedirectCommands;

  export class PreventCommands {
    prevent: () => Router.PreventResult;
  }
  type _PreventCommands = PreventCommands;

  export class EmptyCommands {
  }
  type _EmptyCommands = EmptyCommands;

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

  export interface NavigationTrigger {
    activate(): void;
    inactivate(): void;
  }
  type _NavigationTrigger = NavigationTrigger;

  namespace Router {
    /**
     * @deprecated use `NotFoundResult` instead of `Router.NotFoundResult`
     */
    type NotFoundResult = _NotFoundResult;

    /**
     * @deprecated use `ComponentResult` instead of `Router.ComponentResult`
     */
    type ComponentResult = _ComponentResult;

    /**
     * @deprecated use `PreventResult` instead of `Router.PreventResult`
     */
    type PreventResult = _PreventResult;

    /**
     * @deprecated use `RedirectResult` instead of `Router.RedirectResult`
     */
    type RedirectResult = _RedirectResult;

    /**
     * @deprecated use `ActionResult` instead of `Router.ActionResult`
     */
    type ActionResult = _ActionResult;

    /**
     * @deprecated use `IndexedParams` instead of `Router.IndexedParams`
     */
    type IndexedParams = _IndexedParams;

    /**
     * @deprecated use `Params` instead of `Router.Params`
     */
    type Params = _Params;

    /**
     * @deprecated use `Context` instead of `Router.Context`
     */
    type Context = _Context;

    /**
     * @deprecated use `Commands` instead of `Router.Commands`
     */
    type Commands = _Commands;

    /**
     * @deprecated use `ActionFn` instead of `Router.ActionFn`
     */
    type ActionFn = _ActionFn;

    /**
     * @deprecated use `ChildrenFn` instead of `Router.ChildrenFn`
     */
    type ChildrenFn = _ChildrenFn;

    /**
     * @deprecated use `Route` instead of `Router.Route`
     */
    type Route = _Route;

    /**
     * @deprecated use `RouterOptions` instead of `Router.Options`
     */
    type Options = _RouterOptions;

    /**
     * @deprecated use `RouterLocation` instead of `Router.Location`
     */
    type Location = _RouterLocation;

    /**
     * @deprecated use `NavigationTrigger` instead of `Router.NavigationTrigger`
     */
    type NavigationTrigger = _NavigationTrigger;

    namespace NavigationTrigger {
      const CLICK: _NavigationTrigger;
      const POPSTATE: _NavigationTrigger;
    }
  }
}

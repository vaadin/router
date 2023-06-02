import type {RouterLocation} from "./location";
export * from "../router";

import type {
  NotFoundResult as _NotFoundResult,
  ComponentResult as _ComponentResult,
  PreventResult as _PreventResult,
  RedirectResult as _RedirectResult,
  ActionResult as _ActionResult,
  Context as _Context,
  Commands as _Commands,
  ActionFn as _ActionFn,
  ChildrenFn as _ChildrenFn,
  Route as _Route
} from "../types/route";
import type {
  Params as _Params,
  IndexedParams as _IndexedParams,
} from "../types/params";
import type {
  NavigationTrigger as _NavigationTrigger
} from "../triggers/NavigationTrigger.js";

import {type RouterOptions} from "../router.js";

declare module "../router.js" {
  export namespace Router {
    /**
     * @deprecated use `NotFoundResult` instead of `Router.NotFoundResult`
     */
    export type NotFoundResult = _NotFoundResult;

    /**
     * @deprecated use `ComponentResult` instead of `Router.ComponentResult`
     */
    export type ComponentResult = _ComponentResult;

    /**
     * @deprecated use `PreventResult` instead of `Router.PreventResult`
     */
    export type PreventResult = _PreventResult;

    /**
     * @deprecated use `RedirectResult` instead of `Router.RedirectResult`
     */
    export type RedirectResult = _RedirectResult;

    /**
     * @deprecated use `ActionResult` instead of `Router.ActionResult`
     */
    export type ActionResult = _ActionResult;

    /**
     * @deprecated use `IndexedParams` instead of `Router.IndexedParams`
     */
    export type IndexedParams = _IndexedParams;

    /**
     * @deprecated use `Params` instead of `Router.Params`
     */
    export type Params = _Params;

    /**
     * @deprecated use `Context` instead of `Router.Context`
     */
    export type Context = _Context;

    /**
     * @deprecated use `Commands` instead of `Router.Commands`
     */
    export type Commands = _Commands;

    /**
     * @deprecated use `ActionFn` instead of `Router.ActionFn`
     */
    export type ActionFn = _ActionFn;

    /**
     * @deprecated use `ChildrenFn` instead of `Router.ChildrenFn`
     */
    export type ChildrenFn = _ChildrenFn;

    /**
     * @deprecated use `Route` instead of `Router.Route`
     */
    export type Route = _Route;

    /**
     * @deprecated use `RouterOptions` instead of `Router.Options`
     */
    export type Options = RouterOptions;

    /**
     * @deprecated use `RouterLocation` instead of `Router.Location`
     */
    export type Location = RouterLocation;

    /**
     * @deprecated use `NavigationTrigger` instead of `Router.NavigationTrigger`
     */
    export type NavigationTrigger = _NavigationTrigger;
  }
}

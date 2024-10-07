import type { EmptyObject, RequireAtLeastOne } from 'type-fest';
import type { ResolutionError, ResolverOptions } from './resolver/resolver.js';
import type {
  ActionResult as _ActionResult,
  ChildrenCallback as _ChildrenCallback,
  ChainItem as _ChainItem,
  RouteChildrenContext as _RouteChildrenContext,
  IndexedParams,
  MaybePromise,
  Params,
  ParamValue,
  PrimitiveParamValue,
  Route as _Route,
  RouteContext as _RouteContext,
} from './resolver/types.js';
import type { Router } from './router.js';

export type { ResolutionError, IndexedParams, Params, ParamValue, PrimitiveParamValue };

export type VaadinRouterLocationChangedEvent = CustomEvent<
  Readonly<{
    location: RouterLocation;
    router: Router;
  }>
>;

export type VaadinRouterErrorEvent<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = CustomEvent<
  Readonly<{
    error: ResolutionError<R, C>;
    router: Router<R, C>;
  }> &
    RouteContext<R, C>
>;

export type VaadinRouterGoEvent = CustomEvent<ResolveContext>;

declare global {
  interface WindowEventMap {
    'vaadin-router-go': VaadinRouterGoEvent;
    'vaadin-router-location-changed': VaadinRouterLocationChangedEvent;
    'vaadin-router-error': VaadinRouterErrorEvent;
  }

  interface ArrayConstructor {
    isArray<T extends readonly unknown[]>(arg: unknown): arg is T;
  }
}

export type AnyObject = Record<never, never>;

export type RedirectContextInfo = Readonly<{
  from: string;
  params: IndexedParams;
  pathname: string;
}>;

export interface RedirectResult {
  readonly redirect: RedirectContextInfo;
}

export interface PreventResult {
  readonly cancel: true;
}

export interface NavigationTrigger {
  activate(): void;
  inactivate(): void;
}

export type ActionValue = HTMLElement | PreventResult | RedirectResult;

export type NextResult<R extends AnyObject, C extends AnyObject> = _ActionResult<RouteContext<R, C>>;

export type ActionResult = _ActionResult<ActionValue>;

export type ChainItem<R extends AnyObject, C extends AnyObject> = _ChainItem<
  ActionValue,
  RouteExtension<R, C>,
  ContextExtension<R, C>
> &
  Readonly<{
    element?: WebComponentInterface<R, C>;
  }>;

export type ContextExtension<R extends AnyObject, C extends AnyObject> = Readonly<{
  resolver?: Router<R, C>;
  chain?: Array<ChainItem<R, C>>;
}> &
  C;
// Readonly<{
//   next(resume?: boolean): Promise<ActionResult>;
// }>;

export type ChildrenCallback<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = _ChildrenCallback<
  ActionValue,
  RouteExtension<R, C>,
  ContextExtension<R, C>
>;

export type RouteExtension<R extends AnyObject, C extends AnyObject> = RequireAtLeastOne<{
  children?: ChildrenCallback<R, C> | ReadonlyArray<Route<R, C>>;
  component?: string;
  redirect?: string;
  action?(
    this: Route<R, C>,
    context: RouteContext<R, C>,
    commands: Commands,
  ): MaybePromise<ActionResult | RouteContext<R, C>>;
}> & {
  animate?: AnimateCustomClasses | boolean;
} & R;

export type RouteContext<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = _RouteContext<
  ActionValue,
  RouteExtension<R, C>,
  ContextExtension<R, C>
>;

export type RouteChildrenContext<
  R extends AnyObject = EmptyObject,
  C extends AnyObject = EmptyObject,
> = _RouteChildrenContext<ActionValue, RouteExtension<R, C>, ContextExtension<R, C>>;

export type Route<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = _Route<
  ActionValue,
  RouteExtension<R, C>,
  ContextExtension<R, C>
>;

export type RouterOptions<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = ResolverOptions<
  ActionValue,
  RouteExtension<R, C>,
  ContextExtension<R, C>
>;

/**
 * Describes the state of a router at a given point in time. It is available for
 * your application code in several ways:
 *  - as the `router.location` property,
 *  - as the `location` property set by Vaadin Router on every view Web
 *    Component,
 *  - as the `location` argument passed by Vaadin Router into view Web Component
 *    lifecycle callbacks,
 *  - as the `event.detail.location` of the global Vaadin Router events.
 */
export interface RouterLocation<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> {
  /**
   * The base URL used in the router. See [the `baseUrl` property
   * ](#/classes/Router#property-baseUrl) in the Router.
   *
   * @public
   */
  baseUrl: string;

  /**
   * The fragment identifier (including hash character) for the current page.
   *
   * @public
   */
  hash: string;

  /**
   * A bag of key-value pairs with parameters for the current location. Named
   * parameters are available by name, unnamed ones - by index (e.g. for the
   * `/users/:id` route the `:id` parameter is available as `location.params.id`).
   *
   * See the **Route Parameters** section of the
   * [live demos](#/classes/Router/demos/demo/index.html) for more
   * details.
   *
   * @public
   */
  params: IndexedParams;

  /**
   * The pathname, as it was entered in the browser address bar
   * (e.g. `/users/42/messages/12/edit`). It always starts with a `/` (slash).
   *
   * @public
   */
  pathname: string;

  /**
   * The original pathname string in case if this location is a result of a
   * redirect.
   *
   * E.g. with the routes config as below a navigation to `/u/12` produces a
   * location with `pathname: '/user/12'` and `redirectFrom: '/u/12'`.
   *
   * ```ts
   * setRoutes([
   *   {path: '/u/:id', redirect: '/user/:id'},
   *   {path: '/user/:id', component: 'x-user-view'},
   * ]);
   * ```
   *
   * See the **Redirects** section of the
   * [live demos](#/classes/Router/demos/demo/index.html) for more
   * details.
   *
   * @public
   */
  redirectFrom?: string;

  /**
   * The route object associated with `this` Web Component instance.
   *
   * This property is defined in the `location` objects that are passed as
   * parameters into Web Component lifecycle callbacks, and the `location`
   * property set by Vaadin Router on the Web Components.
   *
   * This property is undefined in the `location` objects that are available
   * as `router.location`, and in the `location` that is included into the
   * global router event details.
   *
   * @public
   */
  route: Route<R, C> | null;

  /**
   * A list of route objects that match the current pathname. This list has
   * one element for each route that defines a parent layout, and then the
   * element for the route that defines the view.
   *
   * See the **Getting Started** section of the
   * [live demos](#/classes/Router/demos/demo/index.html) for more
   * details on child routes and nested layouts.
   *
   * @public
   */
  routes: ReadonlyArray<Route<R, C>>;

  /**
   * The query string portion of the current url.
   *
   * @public
   */
  search: string;

  /**
   * The query search parameters of the current url.
   *
   * @public
   */
  searchParams: URLSearchParams;

  /**
   * Returns a URL corresponding to the route path and the parameters of this
   * location. When the parameters object is given in the arguments,
   * the argument parameters override the location ones.
   *
   * @param params - optional object with parameters to override.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   * @returns generated URL
   * @public
   */
  getUrl(params?: Params): string;
}

/**
 * This interface describes the lifecycle callbacks supported by Vaadin Router
 * on view Web Components. It exists only for documentation purposes, i.e.
 * you _do not need_ to extend it in your code&mdash;defining a method with a
 * matching name is enough (this class does not exist at the run time).
 *
 * If any of the methods described below are defined in a view Web Component,
 * Vaadin Router calls them at the corresponding points of the view
 * lifecycle. Each method can either be synchronous or asynchronous (i.e. return
 * a Promise). In the latter case Vaadin Router waits until the promise is
 * resolved and continues the navigation after that.
 *
 * Check the [documentation on the `Router` class](#/classes/Router)
 * to learn more.
 *
 * Lifecycle callbacks are executed after the new path is resolved and after all
 * `action` callbacks of the routes in the new path are executed.
 *
 * Example:
 *
 * For the following routes definition,
 * ```
 * // router and action declarations are omitted for brevity
 * router.setRoutes([
 *  {path: '/a', action: actionA, children: [
 *    {path: '/b', action: actionB, component: 'component-b'},
 *    {path: '/c', action: actionC, component: 'component-c'}
 *  ]}
 * ]);
 * ```
 * if the router first navigates to `/a/b` path and there was no view rendered
 * before, the following events happen:
 * - actionA
 * - actionB
 * - onBeforeEnterB (if defined in component-b)
 * - outlet contents updated with component-b
 * - onAfterEnterB (if defined in component-b)
 *
 * then, if the router navigates to `/a/c`, the following events take place:
 * - actionA
 * - actionC
 * - onBeforeLeaveB  (if defined in component-b)
 * - onBeforeEnterC (if defined in component-c)
 * - onAfterLeaveB  (if defined in component-b)
 * - outlet contents updated with component-c
 * - onAfterEnterC (if defined in component-c)
 *
 * If a `Promise` is returned by any of the callbacks, it is resolved before
 * proceeding further.
 *
 * Any of the `onBefore...` callbacks have a possibility to prevent
 * the navigation and fall back to the previous navigation result. If there is
 * no result and this is the first resolution, an exception is thrown.
 *
 * `onAfter...` callbacks are considered as non-preventable, and their return
 * value is ignored.
 *
 * Other examples can be found in the
 * [live demos](#/classes/Router/demos/demo/index.html) and tests.
 */
export interface WebComponentInterface<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject>
  extends HTMLElement {
  location?: RouterLocation<R, C>;
  name?: string;

  /**
   * Method that gets executed after the outlet contents is updated with the new
   * element. If the router navigates to the same path twice in a row, and this results
   * in rendering the same component name (if the component is created
   * using `component` property in the route object) or the same component instance
   * (if the component is created and returned inside `action` property of the route object),
   * in the second time the method is not called. The WebComponent instance on which the callback
   * has been invoked is available inside the callback through
   * the `this` reference.
   *
   * This callback is called asynchronously after the native
   * [`connectedCallback()`](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-reactions)
   * defined by the Custom Elements spec.
   *
   * Return values: any return value is ignored and Vaadin Router proceeds with the navigation.
   *
   * Arguments:
   *
   * @param location - the `RouterLocation` object
   * @param commands - empty object
   * @param router - the `Router` instance
   */
  onAfterEnter?(location: RouterLocation<R, C>, commands: EmptyCommands, router: Router<R, C>): void;

  /**
   * Method that gets executed when user navigates away from the component that
   * had defined the method, just before the element is to be removed
   * from the DOM. The difference between this method and `onBeforeLeave`
   * is that when this method is executed, there is no way to abort
   * the navigation. This effectively means that the corresponding component
   * should be resolved by the router before the method can be executed.
   * If the router navigates to the same path twice in a row, and this results
   * in rendering the same component name (if the component is created
   * using `component` property in the route object) or the same component instance
   * (if the component is created and returned inside `action` property of the route object),
   * in the second time the method is not called. The WebComponent instance on which the callback
   * has been invoked is available inside the callback through
   * the `this` reference.
   *
   * Return values: any return value is ignored and Vaadin Router proceeds with the navigation.
   *
   * Arguments:
   *
   * @param location - the `RouterLocation` object
   * @param commands - empty object
   * @param router - the `Router` instance
   */
  onAfterLeave?(location: RouterLocation<R, C>, commands: EmptyCommands, router: Router<R, C>): void;

  /**
   * Method that gets executed before the outlet contents is updated with
   * the new element. The user can prevent the navigation by returning
   * `commands.prevent()` from the method or same value wrapped in `Promise`.
   * If the router navigates to the same path twice in a row, and this results
   * in rendering the same component name (if the component is created
   * using `component` property in the route object) or the same component instance
   * (if the component is created and returned inside `action` property of the route object),
   * in the second time the method is not called. In case of navigating to a different path
   * but within the same route object, e.g. the path has parameter or wildcard,
   * and this results in rendering the same component instance, the method is called if available.
   * The WebComponent instance on which the callback has been invoked is available inside the callback through
   * the `this` reference.
   *
   * Return values:
   *
   * * if the `commands.prevent()` result is returned (immediately or
   * as a Promise), the navigation is aborted and the outlet contents
   * is not updated.
   * * if the `commands.redirect(path)` result is returned (immediately or
   * as a Promise), Vaadin Router ends navigation to the current path, and
   * starts a new navigation cycle to the new path.
   * * any other return value is ignored and Vaadin Router proceeds with
   * the navigation.
   *
   * Arguments:
   *
   * @param location - the `RouterLocation` object
   * @param commands - the commands object with the following methods:
   *
   * | Property                 | Description
   * | -------------------------|-------------
   * | `commands.redirect(path)` | function that creates a redirect data for the path specified, to use as a return
   *   value from the callback.
   * | `commands.prevent()`       | function that creates a special object that can be returned to abort the current
   *   navigation and fall back to the last one. If there is no existing one, an exception is thrown.
   * | `commands.redirectResult(path)` | function that creates a redirect data for the path specified, to use as a return
   *   value from the callback.
   * | `commands.prevent()`       | function that creates a special object that can be returned to abort the current
   *   navigation and fall back to the last one. If there is no existing one, an exception is thrown.
   *
   * @param router - the `Router` instance
   */
  onBeforeEnter?(
    location: RouterLocation<R, C>,
    commands: Commands,
    router: Router<R, C>,
  ): MaybePromise<PreventResult | RedirectResult | void>;

  /**
   * Method that gets executed when user navigates away from the component
   * that had defined the method. The user can prevent the navigation
   * by returning `commands.prevent()` from the method or same value wrapped
   * in `Promise`. This effectively means that the corresponding component
   * should be resolved by the router before the method can be executed.
   * If the router navigates to the same path twice in a row, and this results
   * in rendering the same component name (if the component is created
   * using `component` property in the route object) or the same component instance
   * (if the component is created and returned inside `action` property of the route object),
   * in the second time the method is not called. In case of navigating to a different path
   * but within the same route object, e.g. the path has parameter or wildcard,
   * and this results in rendering the same component instance, the method is called if available.
   * The WebComponent instance on which the callback has been invoked is available inside the callback through
   * the `this` reference.
   *
   * Return values:
   *
   * - if the `commands.prevent()` result is returned (immediately or
   * as a Promise), the navigation is aborted and the outlet contents
   * is not updated.
   * - any other return value is ignored and Vaadin Router proceeds with
   * the navigation.
   *
   * Arguments:
   *
   * @param location - the `RouterLocation` object
   * @param commands - the commands object with the following methods:
   *
   * | Property           | Description
   * | -------------------|-------------
   * | `commands.prevent()` | function that creates a special object that can be returned to abort the current
   *   navigation and fall back to the last one. If there is no existing one, an exception is thrown.
   *
   * @param router - the `Router` instance
   */
  onBeforeLeave?(
    location: RouterLocation<R, C>,
    commands: Commands,
    router: Router<R, C>,
  ): MaybePromise<PreventResult | void>;
}

export type ResolveContext = Readonly<{
  hash?: string;
  pathname: string;
  search?: string;
  redirectFrom?: string;
}>;

export interface Commands {
  component<K extends keyof HTMLElementTagNameMap>(name: K): HTMLElementTagNameMap[K];
  component(name: string): HTMLElement;
  /**
   * function that creates a special object that can be returned to abort
   * the current navigation and fall back to the last one. If there is no
   * existing one, an exception is thrown.
   */
  prevent(): PreventResult;
  redirect(path: string): RedirectResult;
}

export type EmptyCommands = EmptyObject;
export type PreventCommands = Pick<Commands, 'prevent'>;
export type PreventAndRedirectCommands = Pick<Commands, 'prevent' | 'redirect'>;

export type AnimateCustomClasses = Readonly<{
  enter?: string;
  leave?: string;
}>;

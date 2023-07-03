import type { RouterLocation } from '../documentation/location.js';
import type { Commands, PreventResult, RedirectResult } from './route.js';
import type { Router } from '../router.js';

export type PreventAndRedirectCommands = Pick<Commands, 'prevent' | 'redirect'>;
export type PreventCommands = Pick<Commands, 'prevent'>;
export type EmptyCommands = {};

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
 * * actionA
 * * actionB
 * * onBeforeEnterB (if defined in component-b)
 * * outlet contents updated with component-b
 * * onAfterEnterB (if defined in component-b)
 *
 * then, if the router navigates to `/a/c`, the following events take place:
 * * actionA
 * * actionC
 * * onBeforeLeaveB  (if defined in component-b)
 * * onBeforeEnterC (if defined in component-c)
 * * onAfterLeaveB  (if defined in component-b)
 * * outlet contents updated with component-c
 * * onAfterEnterC (if defined in component-c)
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
 *
 */
export interface WebComponentInterface {
  location?: RouterLocation;
}

export interface BeforeEnterObserver extends WebComponentInterface {
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
   * @param location the `RouterLocation` object
   * @param commands the commands object
   * @param router the `Router` instance
   * @return If the `commands.prevent()` result is returned (immediately or
   * as a Promise), the navigation is aborted and the outlet contents
   * is not updated. If the `commands.redirect('/to/path)` result is returned,
   * Vaadin Router proceeds by redirecting to the given path. Any other return
   * value is ignored and Vaadin Router proceeds with the navigation.
   */
  onBeforeEnter(
    location: RouterLocation,
    commands: PreventAndRedirectCommands,
    router: Router,
  ): void | PreventResult | RedirectResult | Promise<void | PreventResult | RedirectResult>;
}

export interface BeforeLeaveObserver extends WebComponentInterface {
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
   * @param location the `RouterLocation` object
   * @param commands the commands object
   * @param router the `Router` instance
   * @return If the `commands.prevent()` result is returned (immediately or
   * as a Promise), the navigation is aborted and the outlet contents
   * is not updated. Any other return value is ignored and Vaadin Router
   * proceeds with the navigation.
   */
  onBeforeLeave(
    location: RouterLocation,
    commands: PreventCommands,
    router: Router,
  ): void | PreventResult | Promise<void | PreventResult>;
}

export interface AfterEnterObserver extends WebComponentInterface {
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
   * @param location the `RouterLocation` object
   * @param commands empty object
   * @param router the `Router` instance
   * @return any return value is ignored and Vaadin Router proceeds with the navigation.
   */
  onAfterEnter(location: RouterLocation, commands: EmptyCommands, router: Router): void;
}

export interface AfterLeaveObserver extends WebComponentInterface {
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
   * @param location the `RouterLocation` object
   * @param commands empty object
   * @param router the `Router` instance
   * @return any return value is ignored and Vaadin Router proceeds with the navigation.
   */
  onAfterLeave(location: RouterLocation, commands: EmptyCommands, router: Router): void;
}

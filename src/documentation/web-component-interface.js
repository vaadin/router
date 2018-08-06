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
 * Check the [documentation on the `Vaadin.Router` class](#/classes/Vaadin.Router)
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
 * If a `Promise` is returned by any of the callbacks, it is resolved before proceeding further.
 * Any of the `onBefore...` callbacks have a possibility to cancel the navigation and fall back
 * to the previous navigation result (if there is no result and this is the first resolution, an exception is thrown).
 * `onAfter...` callbacks are considered as non-cancellable, and their return value is ignored.
 *
 * Other examples can be found in the
 * [live demos](#/classes/Vaadin.Router/demos/demo/index.html) and tests.
 *
 * @memberof Vaadin
 */
export class WebComponentInterface {
  /**
   * Method that gets executed when user navigates away from the component that had defined the method.
   * The user can prevent the navigation by returning `context.cancel()` from the method or same value wrapped in `Promise`.
   * This effectively means that the corresponding component should be resolved by the router before the method can be executed.
   * If the router navigates to the same path twice in a row, in the second time the method is not called.
   * The WebComponent instance on which the callback has been invoked is available inside the callback through the `this` reference.
   *
   * @param context the context object with the following properties:
   *
   * | Property           | Description
   * | -------------------|-------------
   * | `context.pathname` | string with the pathname being rendered.
   * | `context.params`   | object with route parameters, contains string keys for named and numeric keys for unnamed parameters.
   * | `context.route`    | object that holds the route being rendered.
   * | `context.cancel()` | function that creates a special object that can be returned to abort the current navigation and fall back to the last one. If there is no existing one, an exception is thrown.
   *
   * Return values:
   *
   * * if `context.cancel()` is returned (immediately or as a Promise), the navigation is aborted and the outlet contents is not updated.
   * * any other return value is ignored and Vaadin Router proceeds with the navigation.
   */
  onBeforeLeave(context) {
    // user implementation example:
    if (this.hasUnfinishedChanges()) {
      return context.cancel();
    }
  }

  /**
   * Method that gets executed before the outlet contents is updated with the new element.
   * The user can prevent the navigation by returning `context.cancel()` from the method or same value wrapped in `Promise`.
   * If the router navigates to the same path twice in a row, in the second time the method is not called.
   * the WebComponent instance on which the callback has been invoked is available inside the callback through the `this` reference.
   *
   * @param context the context object with the following properties:
   *
   * | Property                 | Description
   * | -------------------------|-------------
   * | `context.pathname`       | string with the pathname being rendered.
   * | `context.params`         | object with route parameters, contains string keys for named and numeric keys for unnamed parameters.
   * | `context.route`          | object that holds the route being rendered.
   * | `context.redirect(path)` | function that creates a redirect data for the path specified, to use as a return value from the callback.
   * | `context.cancel()`       | function that creates a special object that can be returned to abort the current navigation and fall back to the last one. If there is no existing one, an exception is thrown.
   *
   * Return values:
   *
   * * if a `context.cancel()` object is returned (immediately or as a Promise), the navigation is aborted and the outlet contents is not updated.
   * * if a `context.redirect(path)` object is returned (immediately or as a Promise), Vaadin Router ends navigation to the current path, and starts a new navigation cycle to the new path.
   * * any other return value is ignored and Vaadin Router proceeds with the navigation.
   */
  onBeforeEnter(context) {
    // user implementation example:
    if (context.params.userName === 'admin') {
      return context.redirect(context.pathname + '?admin');
    }
  }

  /**
   * Method that gets executed when user navigates away from the component that had defined the method, just before the element is to be removed from the DOM.
   * The difference between this method and `onBeforeLeave` is that when this method is executed, there is no way to abort the navigation.
   * This effectively means that the corresponding component should be resolved by the router before the method can be executed.
   * If the router navigates to the same path twice in a row, in the second time the method is not called.
   * The WebComponent instance on which the callback has been invoked is available inside the callback through the `this` reference.
   *
   * @param context the context object with the following properties:
   *
   * | Property           | Description
   * | ------------------ |-------------
   * | `context.pathname` | string with the pathname being rendered.
   * | `context.params`   | object with route parameters, contains string keys for named and numeric keys for unnamed parameters.
   * | `context.route`    | object that holds the route being rendered.
   *
   * Return values: any return value is ignored and Vaadin Router proceeds with the navigation.
   */
  onAfterLeave(context) {
    // user implementation example:
    storeTimeSpentOnTheView();
  }

  /**
   * Method that gets executed after the outlet contents is updated with the new element.
   * If the router navigates to the same path twice in a row, in the second time the method is not called.
   * The WebComponent instance on which the callback has been invoked is available inside the callback through the `this` reference.
   *
   * This callback is called asynchronously after the native
   * [`connectedCallback()`](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-reactions)
   * defined by the Custom Elements spec.
   *
   * @param context the context object with the following properties:
   *
   * | Property           | Description
   * | ------------------ |-------------
   * | `context.pathname` | string with the pathname being rendered.
   * | `context.params`   | object with route parameters, contains string keys for named and numeric keys for unnamed parameters.
   * | `context.route`    | object that holds the route being rendered.
   *
   * Return values: any return value is ignored and Vaadin Router proceeds with the navigation.
   */
  onAfterEnter(context) {
    // user implementation example:
    sendVisitStatistics();
  }
}

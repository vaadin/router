/**
 * A WebComponent interface created for documentation purposes.
 * Describes lifecycle callback methods supported by `Vaadin.Router`.
 *
 * Define any of the methods described below in the WebComponent declaration to get the lifecycle callbacks support.
 * Each method can either be asynchronous or synchronous – in any case, the resolution won't finish until the
 * method result is retrieved.
 *
 * This documentation assumes that the reader is familiar with `Vaadin.Router` documentation.
 *
 * Lifecycle callbacks are executed during the resolution path and after all each route `action` callbacks are executed.
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
 * if the router first navigates to `/a/b` path and there were no paths resolved before, the following resolution chain happens:
 * * actionA
 * * actionB
 * * onBeforeEnterB (if defined in component-b)
 * * outlet contents updated with component-b
 * * onAfterEnterB (if defined in component-b)
 *
 * then, if router navigates to `/a/c`, the following resolution chain takes place:
 * * actionA
 * * actionC
 * * onBeforeLeaveB  (if defined in component-b)
 * * onBeforeEnterC (if defined in component-c)
 * * outlet contents updated with component-c
 * * onAfterEnterC (if defined in component-c)
 *
 * Any of the callbacks happening before the outlet contents update have the possibility to cancel the resolution chain
 * and fall back to the previous resolution result (if there is no result and this is the first resolution, an exception will be thrown).
 *
 * Other examples can be found in demos and tests.
 *
 * @memberof Vaadin
 * @summary documentation on `Vaadin.Router` lifecycle callbacks
 */
export class WebComponentInterface {
  /**
   * Method that gets executed when user navigates away from the component that had defined the method.
   * This effectively means that the corresponding component should be resolved by the router before the method can be executed.
   * If the router navigates to the same path, the method is not called.
   * WebComponent that defines a callback is available inside the callback through the `this` reference.
   *
   * @param context parameter, has the following properties:
   * * `context.pathname` – string with the pathname being resolved.
   *
   * * `context.params` – object with route parameters.
   *
   * * `context.route` – object that holds the route that is currently being rendered.
   *
   * * `context.cancel()` – function that creates a special object that can be returned to abort the current resolution
   * and fall back to the existing one. If there is no existing one, an exception is thrown.
   *
   * @return
   *
   * * if `context.cancel()` is returned (or a Promise that results in this value),
   * the route resolution is aborted and the outlet contents is not updated by the router.
   *
   * * any other return value is ignored and the resolution process is continued.
   */
  onBeforeLeave(context) {
    // user implementation example:
    if (this.hasUnfinishedChanges()) {
      return context.cancel();
    }
  }

  /**
   * Method that gets executed before the outlet contents is updated with the new element.
   * If the router navigates to the same path, the method is not called.
   * WebComponent that defines a callback is available inside the callback through the `this` reference.
   *
   * @param context parameter, has the following properties:
   * * `context.pathname` – string with the pathname being resolved.
   *
   * * `context.params` – object with route parameters.
   *
   * * `context.route` – object that holds the route that is currently being rendered.
   *
   * * `context.cancel()` – function that creates a special object that can be returned to abort the current resolution
   * and fall back to the existing one. If there is no existing one, an exception is thrown.
   *
   * * `context.redirect(path)` – function that creates a redirect data for the path specified.
   *
   * @return
   *
   * * if `context.cancel()` is returned (or a Promise that results in this value), the route resolution is aborted
   * the route resolution is aborted and the outlet contents is not updated by the router.
   *
   * * if `context.redirect(path)` is returned (or a Promise that results in this value), the corresponding path
   * is attempted to be resolved during the next resolution steps.
   *
   * * any other return value is ignored and the resolution process is continued.
   */
  onBeforeEnter(context) {
    // user implementation example:
    if (context.params.userName === 'admin') {
      return context.redirect(context.pathname + '?admin');
    }
  }

  /**
   * Method that gets executed after the outlet contents is updated with the new element.
   * If the router navigates to the same path, the method is not called.
   * WebComponent that defines a callback is available inside the callback through the `this` reference.
   *
   * @param context parameter, has the following properties:
   * * `context.pathname` – string with the pathname being resolved.
   *
   * * `context.params` – object with route parameters.
   *
   * * `context.route` – object that holds the route that is currently being rendered.
   *
   * @return any return value is ignored and the resolution process is continued.
   */
  onAfterEnter(context) {
    // user implementation example:
    return new Promise(resolve => {
      // eslint-disable-next-line no-undef
      sendBackendStatistics();
      resolve();
    });
  }
}

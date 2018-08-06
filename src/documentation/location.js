/**
 * This is a type declaration. It exists for build-time type checking and
 * documentation purposes. It should not be used in any source code, and it
 * certainly does not exist at the run time.
 *
 * `Location` describes the state of a router at a given point in time. It is
 * available for your application code in several ways:
 *  - as the `router.location` property
 *  - as the `location` property set by Vaadin Router on every view Web Component
 *  - as the `location` argument passed by Vaadin Router into view Web Component
 *    lifecycle callbacks
 *  - as the `event.detail.location` of the global Vaadin Router events
 *
 * @memberof Vaadin.Router
 * @summary Type declaration for the `router.location` property.
 */
export class Location {
  constructor() {
    /**
     * The pathname as entered in the browser address bar
     * (e.g. `/users/42/messages/12/edit`). It always starts with a `/` (slash).
     *
     * @public
     * @type {!string}
     */
    this.pathname;

    /**
     * (optional) The original pathname string in case if this location is a
     * result of a redirect.
     *
     * E.g. with the routes config as below a navigation to `/u/12` produces a
     * location with `pathname: '/user/12'` and `redirectFrom: '/u/12'`.
     *
     * ```javascript
     * setRoutes([
     *   {path: '/u/:id', redirect: '/user/:id'},
     *   {path: '/user/:id', component: 'x-user-view'},
     * ]);
     * ```
     *
     * See the **Redirects** section of the
     * [live demos](#/classes/Vaadin.Router/demos/demo/index.html) for more
     * details.
     *
     * @public
     * @type {?string}
     */
    this.redirectFrom;

    /**
     * (optional) The route object associated with `this` Web Component instance.
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
     * @type {?Vaadin.Router.Route}
     */
    this.route;

    /**
     * A list of route objects that match the current pathname. This list has
     * one element for each route that defines a parent layout, and then the
     * element for the route that defines the view.
     *
     * See the **Getting Started** section of the
     * [live demos](#/classes/Vaadin.Router/demos/demo/index.html) for more
     * details on child routes and nested layouts.
     *
     * @public
     * @type {!Array<!Vaadin.Router.Route>}
     */
    this.routes;

    /**
     * A bag of key-value pairs with parameters for the current location. Named
     * parameters are available by name, unnamed ones - by index (e.g. for the
     * `/users/:id` route the `:id` parameter is available as `location.params.id`).
     *
     * See the **Route Parameters** section of the
     * [live demos](#/classes/Vaadin.Router/demos/demo/index.html) for more
     * details.
     *
     * @public
     * @type {!Object}
     */
    this.params;
  }
}

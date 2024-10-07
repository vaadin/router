import type { AnyObject, EmptyObject } from '@ausginer/router';
import type { IndexedParams, Params } from './general.js';
import type { Route } from './Route.js';

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

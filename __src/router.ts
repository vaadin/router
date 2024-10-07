import {
  type AnyObject,
  type EmptyObject,
  Router as _Router,
  type RouterContext as _RouterContext,
  type Route as _Route,
  type RouterOptions as _RouterOptions,
} from '@ausginer/router';
import type { ActionValue } from '../src/types.js';
import type { Params, RedirectContextInfo } from './types/general.js';
import type { Route } from './types/Route.js';
import type { RouteContext } from './types/RouteContext.js';
import type { RouterLocation } from './types/RouterLocation.js';
import type { ResolveRouteCallback, RouterOptions } from './types/RouterOptions.js';

function transformOptionsFromRouterToImpl<R extends AnyObject, C extends AnyObject>({
  baseUrl,
  errorHandler,
}: RouterOptions<R, C> = {}) {
  const baseHref = document.head.querySelector('base')?.getAttribute('href');

  return {
    baseURL: baseUrl ?? baseHref ?? undefined,
    // @ts-expect-error: ignore "void" type here
    errorHandler: errorHandler ? (error, _) => errorHandler(error) : undefined,
  };
}

export class Router<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> {
  /**
   * Triggers navigation to a new path. Returns a boolean without waiting until
   * the navigation is complete. Returns `true` if at least one `Router`
   * has handled the navigation (was subscribed and had `baseUrl` matching
   * the `path` argument), otherwise returns `false`.
   *
   * @param path - A new in-app path string, or an URL-like object with
   * `pathname` string property, and optional `search` and `hash` string
   * properties.
   */
  static go(path: string | ResolveContext): boolean;

  /**
   * Configures what triggers Router navigation events:
   *  - `POPSTATE`: popstate events on the current `window`
   *  - `CLICK`: click events on `<a>` links leading to the current page
   *
   * This method is invoked with the pre-configured values when creating a new Router instance.
   * By default, both `POPSTATE` and `CLICK` are enabled. This setup is expected to cover most of the use cases.
   *
   * See the `router-config.js` for the default navigation triggers config. Based on it, you can
   * create the own one and only import the triggers you need, instead of pulling in all the code,
   * e.g. if you want to handle `click` differently.
   *
   * See also **Navigation Triggers** section in [Live Examples](#/classes/Router/demos/demo/index.html).
   *
   * @param triggers - navigation triggers
   */
  static setTriggers(...triggers: readonly NavigationTrigger[]): void;

  readonly #impl: _Router<ActionValue, R, C>;

  readonly #resolveRoute?: ResolveRouteCallback<R, C>;

  readonly #context?: RouteContext<R, C>;

  declare ['constructor']: typeof Router;

  /**
   * Creates a new Router instance with a given outlet, and
   * automatically subscribes it to navigation events on the `window`.
   * Using a constructor argument or a setter for outlet is equivalent:
   *
   * ```
   * const router = new Router();
   * router.setOutlet(outlet);
   * ```
   * @param outlet - a container to render the resolved route
   * @param options - an optional object with options
   */
  constructor(outlet?: Element | DocumentFragment | null, options?: RouterOptions<R, C>) {
    this.#context = options?.context;
    this.#resolveRoute = options?.resolveRoute;

    this.#impl = new _Router<ActionValue, R, C>([], transformOptionsFromRouterToImpl<R, C>(options));

    this.setOutlet(outlet);
    this.subscribe();
  }

  resolve(context: RouteContext<R, C>): Promise<RouteContext<R, C> & RedirectContextInfo> {}

  setOutlet(outlet?: Element | DocumentFragment | null): void;

  getOutlet(): Element | DocumentFragment | null | undefined;

  async setRoutes(routes: Route<R, C> | ReadonlyArray<Route<R, C>>, skipRender = false): Promise<RouterLocation<R, C>>;

  /**
   * Subscribes this instance to navigation events on the `window`.
   *
   * NOTE: beware of resource leaks. For as long as a router instance is
   * subscribed to navigation events, it won't be garbage collected.
   */
  subscribe(): void {
    window.addEventListener('vaadin-router-go', this.__navigationEventHandler);
  }

  /**
   * Removes the subscription to navigation events created in the `subscribe()`
   * method.
   */
  unsubscribe(): void {
    window.removeEventListener('vaadin-router-go', this.__navigationEventHandler);
  }

  /**
   * Generates a URL for the route with the given name, optionally performing
   * substitution of parameters.
   *
   * The route is searched in all the Router instances subscribed to
   * navigation events.
   *
   * **Note:** For child route names, only array children are considered.
   * It is not possible to generate URLs using a name for routes set with
   * a children function.
   *
   * @param name - The route name or the route’s `component` name.
   * @param params - Optional object with route path parameters.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   */
  urlForName(name: string, params?: Params | null): string;

  /**
   * Generates a URL for the given route path, optionally performing
   * substitution of parameters.
   *
   * @param path - String route path declared in [express.js
   * syntax](https://expressjs.com/en/guide/routing.html#route-paths).
   * @param params - Optional object with route path parameters.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   */
  urlForPath(path: string, params?: Params | null): string;
}

/// <reference types="urlpattern-polyfill" />
import {
  type EmptyObject,
  Router as _Router,
  type Route as _Route,
  type RouterOptions as _RouterOptions,
  navigate,
  addNavigationListener,
} from '@ausginer/router';
import { izip } from 'itertools';
import {
  createCommand,
  isComponentCommand,
  isPreventCommand,
  isRedirectCommand,
  type Command,
  type Commands,
  type ComponentCommand,
  type PreventCommand,
  type RedirectCommand,
} from './internals/Commands.js';
import { createRouterLocation, type RouterLocation } from './internals/RouterLocation.js';
import type { InternalResult, Params, RedirectContextInfo } from './types/general.js';
import type { InternalRoute, Route } from './types/Route.js';
import type { ChainItem, RouteContext } from './types/RouteContext.js';
import type { ResolveRouteCallback, RouterOptions } from './types/RouterOptions.js';
import type { WebComponentInterface } from './types/WebComponentInterface.js';
import { ensureRoutes, log } from './utils.js';

function convertOptions<R extends object, C extends object>({
  baseUrl,
  errorHandler,
}: RouterOptions<R, C> = {}): _RouterOptions<ReadonlyArray<InternalResult<R, C>> | PreventCommand | RedirectCommand> {
  const baseHref = document.head.querySelector('base')?.getAttribute('href');

  return {
    baseURL: baseUrl ?? baseHref ?? undefined,
    errorHandler,
  };
}

function ensureOutlet(outlet?: Element | DocumentFragment | null): void {
  if (!(outlet instanceof Element || outlet instanceof DocumentFragment)) {
    throw new TypeError(log(`Expected router outlet to be a valid DOM Element | DocumentFragment (but got ${outlet})`));
  }
}

const commands: Commands = {
  component: (name) => createCommand({ name }),
  redirect: (to) => createCommand({ to }),
  prevent: () => createCommand({ cancel: true }),
};

export class Router<R extends object = EmptyObject, C extends object = EmptyObject> {
  #urlForName: undefined;
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

  readonly #resolveRoute?: ResolveRouteCallback<R, C>;

  readonly #context?: RouteContext<R, C>;

  readonly #options?: RouterOptions<R, C>;
  readonly #location = createRouterLocation<R, C>({ resolver: this });
  readonly #routes = new WeakMap<InternalRoute<R, C>, Route<R, C>>();
  #controller?: AbortController;
  #impl: _Router<ReadonlyArray<InternalResult<R, C>> | PreventCommand | RedirectCommand, R, C>;
  #outlet?: Element | DocumentFragment | null;
  #previousResolved: ReadonlyArray<InternalResult<R, C>> | null = null;
  #ready: Promise<void> = Promise.resolve(this.#location);

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
    this.#options = options;

    this.#impl = new _Router<ReadonlyArray<InternalResult<R, C>> | PreventCommand | RedirectCommand, R, C>(
      [],
      convertOptions<R, C>(options),
    );

    // setNavigationTriggers(Object.values(DEFAULT_TRIGGERS));

    this.outlet = outlet;
    this.subscribe();
  }

  get ready(): Promise<void> {
    return this.#ready;
  }

  get baseUrl(): string {
    return this.#impl.options.baseURL?.toString() ?? '';
  }

  get outlet(): Element | DocumentFragment | null | undefined {
    return this.#outlet;
  }

  /**
   * Sets the router outlet (the DOM node where the content for the current
   * route is inserted). Any content pre-existing in the router outlet is
   * removed at the end of each render pass.
   *
   * @remarks
   * This setter is automatically invoked first time when creating a new Router
   * instance.
   *
   * @param outlet - the DOM node where the content for the current route is
   * inserted.
   */
  set outlet(outlet: Element | DocumentFragment | null | undefined) {
    ensureOutlet(outlet);
    this.#outlet = outlet;
  }
  async resolve(context: RouteContext<R, C>): Promise<RouteContext<R, C> & RedirectContextInfo> {}

  /**
   * @see {@link Router.outlet}
   * @deprecated - Use `router.outlet = outlet` instead.
   */
  setOutlet(outlet?: Element | DocumentFragment | null): void {
    this.outlet = outlet;
  }

  /**
   * @deprecated - Use `router.outlet` instead.
   */
  getOutlet(): Element | DocumentFragment | null | undefined {
    return this.#outlet;
  }

  async setRoutes(routes: Route<R, C> | ReadonlyArray<Route<R, C>>, skipRender = false): Promise<RouterLocation<R, C>> {
    this.#urlForName = undefined;
    ensureRoutes(routes);
    this.#impl = new _Router(this.#convertRoutes(routes), this.#impl.options);

    if (!skipRender) {
      this.#ready = this.#onNavigation();
    }

    return await this.#ready;
  }

  /**
   * Subscribes this instance to navigation events on the `window`.
   *
   * @remarks
   * Beware of resource leaks. For as long as a router instance is subscribed to
   * navigation events, it won't be garbage collected.
   */
  subscribe(): void {
    this.#controller = new AbortController();
    addNavigationListener(this.#onNavigation.bind(this), { signal: this.#controller.signal });
  }

  /**
   * Removes the subscription to navigation events created in the `subscribe()`
   * method.
   */
  unsubscribe(): void {
    this.#controller?.abort();
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
  urlForName(name: string, params?: Params | null): string {
    for (const [route, _route] of this.#routes) {
      if (route.name === name || route.component === name) {
        return this.#impl.createURL(_route, params ?? undefined);
      }
    }
  }

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
  urlForPath(path: string, params?: Params | null): string {}

  async #onNavigation(url: URL, ctx?: C): Promise<void> {
    const resolved = await this.#impl.resolve(url, ctx as C extends EmptyObject ? never : C);

    if (isPreventCommand(resolved) || !resolved) {
      return;
    }

    if (isRedirectCommand(resolved)) {
      navigate(resolved.to);
      return;
    }

    for await (const result of this.#processResolved(resolved)) {
      if (isPreventCommand(result)) {
        return;
      }

      if (isRedirectCommand(result)) {
        navigate(result.to);
        return;
      }
    }
  }

  #createLocation(context: RouteContext<R, C>, route: InternalRoute<R, C>): RouterLocation<R, C> {
    return createRouterLocation<R, C>(
      context,
      (params = {}) => {
        const _params = Object.fromEntries(
          Object.entries(params).map(([key, value]) => [key, value ? String(value) : '']),
        );
        const _url = this.#impl.createURL(route, _params);
        return _url ? `${_url.pathname}?${_url.search}${_url.hash}` : '';
      },
      this.#routes.get(route),
    );
  }

  async *#processResolved(
    resolved: ReadonlyArray<InternalResult<R, C>>,
  ): AsyncGenerator<Command | undefined | void, void, void> {
    let parent = this.#outlet;

    if (!parent) {
      return;
    }

    if (this.#previousResolved) {
      for (const [{ element, location }, current] of izip(
        this.#previousResolved.slice().reverse(),
        resolved.slice().reverse(),
      )) {
        if (element) {
          // ESLINT: This is an async generator, so we can await in a loop
          // eslint-disable-next-line no-await-in-loop
          yield await element.onBeforeLeave?.(location, commands, this);
          if (element !== current.element) {
            element.remove();
          }
          yield element.onAfterLeave?.(location, commands, this);
        }
      }
    }

    for (const { element } of resolved) {
      if (element) {
        // ESLINT: This is an async generator, so we can await in a loop
        // eslint-disable-next-line no-await-in-loop
        yield await element.onBeforeEnter?.(location, commands, this);

        if (!element.isConnected) {
          parent.append(element);
        }

        yield element.onAfterEnter?.(location, commands, this);

        parent = element;
      }
    }

    this.#previousResolved = resolved;
  }

  #convertRoutes(routes: ReadonlyArray<Route<R, C>>): ReadonlyArray<InternalRoute<R, C>> {
    const self = this;

    return routes.map((route) => {
      const { action, component, redirect, path, children, ...routeRest } = route;

      let element: WebComponentInterface<R, C> | undefined;

      if (component) {
        element = document.createElement(component);
      }

      const impl: InternalRoute<R, C> = {
        children: children ? this.#convertRoutes(children) : undefined,
        path,
        async action({ branch, next, result, url, router: _, ...contextRest }) {
          if (redirect) {
            return createCommand({ to: redirect });
          }

          const { pathname, hash, search, searchParams } = url;
          const {
            pathname: { groups },
          } = result;

          const chain = branch.map((r) => self.#routes.get(r)!);

          let actionResult: ComponentCommand | undefined;
          let nextResult: ReadonlyArray<InternalResult<R, C>> | null | undefined;

          const context: RouteContext<R, C> = {
            pathname,
            hash,
            search,
            searchParams,
            params: groups,
            chain,
            resolver: self,
            route,
            async next() {
              const res = await next();

              if (isRedirectCommand(res) || isPreventCommand(res)) {
                return res;
              }

              nextResult = res;

              return res?.[0].result;
            },
            ...(contextRest as C),
          };

          if (action) {
            const res = await action.call(route, context, commands);

            if (isRedirectCommand(res) || isPreventCommand(res)) {
              return res;
            }

            if (isComponentCommand(res)) {
              if (!element || element.localName !== res.name) {
                element = document.createElement(res.name);
              }

              actionResult = res;
            }
          } else {
            const res = await next();

            if (isRedirectCommand(res) || isPreventCommand(res)) {
              return res;
            }

            nextResult = res;
            actionResult = component ? createCommand({ name: component }) : undefined;
          }

          return [
            {
              element,
              route: this,
              result: actionResult,
              location: self.#createLocation(context, this),
            } satisfies InternalResult<R, C>,
            ...(nextResult ?? []),
          ];
        },
        ...(routeRest as R),
      };

      return impl;
    });
  }
}

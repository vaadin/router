/// <reference types="urlpattern-polyfill" />
import {
  type EmptyObject,
  Router as _Router,
  type Route as _Route,
  type RouterOptions as _RouterOptions,
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
import type { RouterLocation } from './internals/RouterLocation.js';
import { DEFAULT_TRIGGERS, setNavigationTriggers } from './triggers/navigation.js';
import type { NavigationTrigger } from './triggers/types.js';
import type { EventDetails, VaadinRouterGoEvent } from './types/events.js';
import type { IndexedParams, InternalResult } from './types/general.js';
import type { InternalRoute, Route } from './types/Route.js';
import type { InternalRouteContext, RenderContext, RouteContext } from './types/RouteContext.js';
import type { RouterOptions } from './types/RouterOptions.js';
import type { WebComponentInterface } from './types/WebComponentInterface.js';
import { ensureRoutes, fireRouterEvent, isString, log, traverse } from './utils.js';

function convertOptions<R extends object, C extends object>({
  baseUrl = '',
  errorHandler,
}: RouterOptions<R, C> = {}): _RouterOptions<ReadonlyArray<InternalResult<R, C>> | PreventCommand | RedirectCommand> {
  return {
    baseURL: new URL('./', new URL(baseUrl, document.baseURI || document.URL)),
    errorHandler(error) {
      const result = errorHandler?.(error);

      if (isPreventCommand(result) || isRedirectCommand(result)) {
        return result;
      }

      return [{ result: result as ComponentCommand | undefined }];
    },
  };
}

function ensureOutlet(outlet?: Element | DocumentFragment | null): void {
  if (!(outlet instanceof Element || outlet instanceof DocumentFragment)) {
    throw new TypeError(log(`Expected router outlet to be a valid DOM Element | DocumentFragment (but got ${outlet})`));
  }
}

function updateBrowserHistory(url: URL, replace?: boolean): void {
  if (window.location.href !== url.href) {
    window.history[replace ? 'replaceState' : 'pushState'](null, document.title, url.toString());
    window.dispatchEvent(new PopStateEvent('popstate', { state: 'vaadin-router-ignore' }));
  }
}

const commands: Commands = {
  component: (name) => createCommand({ name }),
  redirect: (to) => createCommand({ to }),
  prevent: () => createCommand({ cancel: true }),
};

export class Router<R extends object = EmptyObject, C extends object = EmptyObject> {
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
  static go<C extends object = EmptyObject>(path: string | URL, context?: C): boolean {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const state = { context, path: path.toString() } as EventDetails<VaadinRouterGoEvent<C>>;
    return fireRouterEvent('go', state);
  }

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
  static setTriggers(...triggers: readonly NavigationTrigger[]): void {
    setNavigationTriggers(triggers);
  }

  readonly options?: RouterOptions<R, C>;
  readonly #routeMap = new WeakMap<InternalRoute<R, C>, Route<R, C>>();
  #location: RouterLocation<R, C>;
  #controller?: AbortController;
  #impl: _Router<ReadonlyArray<InternalResult<R, C>> | PreventCommand | RedirectCommand, R, C>;
  #outlet?: Element | DocumentFragment | null;
  #previousResolved: ReadonlyArray<InternalResult<R, C>> | null = null;
  #ready: Promise<RouterLocation<R, C>>;
  #routes: ReadonlyArray<Route<R, C>> = [];

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
    this.options = options;

    this.#impl = new _Router<ReadonlyArray<InternalResult<R, C>> | PreventCommand | RedirectCommand, R, C>(
      [],
      convertOptions(options),
    );

    this.#location = {
      baseUrl: this.#impl.baseURL,
      getUrl: () => '',
      hash: '',
      params: {},
      pathname: '',
      routes: [],
      search: '',
      searchParams: new URLSearchParams(),
    };

    this.#ready = Promise.resolve(this.#location);

    setNavigationTriggers(Object.values(DEFAULT_TRIGGERS));

    this.outlet = outlet;
    this.subscribe();
  }

  get ready(): Promise<RouterLocation<R, C>> {
    return this.#ready;
  }

  get baseUrl(): URL {
    return this.#impl.baseURL;
  }

  get routes(): ReadonlyArray<Route<R, C>> {
    return this.#routes;
  }

  get location(): RouterLocation<R, C> {
    return this.#location;
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
    if (outlet) {
      ensureOutlet(outlet);
    }

    this.#outlet = outlet;
  }

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
    const _routes = ensureRoutes(routes);
    this.#impl = new _Router(this.#convertRoutes(_routes), this.#impl);
    this.#routes = _routes;

    if (!skipRender) {
      this.#ready = this.render(new URL(location.href));
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
    addEventListener(
      'vaadin-router-go',
      (e: VaadinRouterGoEvent) => {
        e.preventDefault();

        // eslint-disable-next-line no-void
        void this.render({
          pathname: new URL(e.detail.path, this.#impl.baseURL),
          ...e.detail.context,
        } as RenderContext<C>);
      },
      { signal: this.#controller.signal },
    );
  }

  /**
   * Removes the subscription to navigation events created in the `subscribe()`
   * method.
   */
  unsubscribe(): void {
    this.#controller?.abort();
  }

  async render(
    pathnameOrContext: string | URL | RenderContext<C>,
    shouldUpdateHistory = false,
  ): Promise<RouterLocation<R, C>> {
    this.#ready = this.#render(pathnameOrContext, shouldUpdateHistory);
    return await this.#ready;
  }

  async #render(
    pathnameOrContext: string | URL | RenderContext<C>,
    shouldUpdateHistory = false,
  ): Promise<RouterLocation<R, C>> {
    let pathname: string;
    let context: object | undefined;

    if (pathnameOrContext instanceof URL) {
      ({ pathname } = pathnameOrContext);
    } else if (isString(pathnameOrContext)) {
      pathname = pathnameOrContext;
    } else {
      const { pathname: _pathname, ...rest } = pathnameOrContext;
      pathname = _pathname instanceof URL ? _pathname.pathname : _pathname;
      context = rest;
    }

    const url = new URL(pathname, this.baseUrl);
    const resolved = await this.#impl.resolve(url, context as C extends EmptyObject ? never : C);

    if (isPreventCommand(resolved) || !resolved) {
      return this.#location;
    }

    if (isRedirectCommand(resolved)) {
      return await this.render({ pathname: resolved.to, ...context } as RenderContext<C>, shouldUpdateHistory);
    }

    for await (const result of this.#processResolved(resolved)) {
      if (isPreventCommand(result)) {
        break;
      }

      if (isRedirectCommand(result)) {
        return await this.render({ pathname: result.to, ...context } as RenderContext<C>, shouldUpdateHistory);
      }
    }

    updateBrowserHistory(url, shouldUpdateHistory);

    fireRouterEvent('location-changed', {
      router: this,
      location: this.location,
    });

    return this.#location;
  }

  /**
   * Generates a URL for the route with the given name, optionally performing
   * substitution of parameters.
   *
   * The route is searched in all the Router instances subscribed to
   * navigation events.
   *
   * @param name - The route name or the route’s `component` name.
   * @param params - Optional object with route path parameters.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   */
  urlForName(name: string, params?: IndexedParams | null): URL | undefined {
    const { routes } = this.#impl;
    let [parent] = routes;
    let paths: string[] = [];
    for (const route of traverse(routes)) {
      if (parent.children?.includes(route)) {
        paths.push(route.path);
        parent = route;
      } else {
        paths = [route.path];
      }

      if (this.#routeMap.get(route)!.name === name) {
        return this.urlForPath(
          paths
            .map((p) => p.replace(/^\/*(.*?)\/*$/u, '$1'))
            .filter((p) => p)
            .join('/'),
          params,
        );
      }
    }

    return undefined;
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
  urlForPath(path: string, params?: IndexedParams | null): URL {
    const baseUrl = String(this.#impl.baseURL);
    const url = new URL(path, baseUrl);

    if (params) {
      const pattern = new URLPattern(path, baseUrl);
      const result = pattern.exec(url)!;

      return new URL(
        Object.entries(result.pathname.groups).reduce((acc, [name, part]) => {
          if (name in params && part) {
            return acc.replace(part, String(params[name] ?? part));
          }

          return acc;
        }, url.toString()),
      );
    }

    return url;
  }

  async *#processResolved(
    resolved: ReadonlyArray<InternalResult<R, C>>,
  ): AsyncGenerator<Command | undefined | void, void, void> {
    let parent = this.#outlet;

    if (!parent) {
      return;
    }

    if (this.#previousResolved) {
      for (const [{ element }, current] of izip(this.#previousResolved.slice().reverse(), resolved.slice().reverse())) {
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
        async action(ctx) {
          const { branch, next, result, url, router: _, ...contextRest } = ctx;
          if (redirect) {
            return createCommand({ to: redirect });
          }

          const { pathname, hash, search, searchParams } = url;
          const {
            pathname: { groups },
          } = result;

          const chain = branch.map((r) => self.#routeMap.get(r)!);

          if (self.#location.pathname !== pathname) {
            self.#location = self.#createLocation(ctx);
          }

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
            } satisfies InternalResult<R, C>,
            ...(nextResult ?? []),
          ];
        },
        ...(routeRest as R),
      };

      return impl;
    });
  }

  #createLocation(
    {
      branch,
      result: {
        pathname: { groups },
      },
      url: { pathname, hash, search, searchParams },
      router,
    }: InternalRouteContext<R, C>,
    route?: Route<R, C>,
  ): RouterLocation<R, C> {
    const routes = branch.map((r) => this.#routeMap.get(r)!);

    return {
      baseUrl: router.options.baseURL?.toString() ?? '',
      getUrl: (params) => this.urlForPath(pathname, params),
      hash,
      params: groups,
      pathname,
      route,
      routes,
      search,
      searchParams,
    };
  }
}

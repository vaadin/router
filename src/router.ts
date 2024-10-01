/* eslint-disable @typescript-eslint/consistent-return */
import { compile } from 'path-to-regexp';
import type { EmptyObject } from 'type-fest';
import type { ChainItem, InternalNextResult, InternalRoute, InternalRouteContext, ResolveResult } from './internal.js';
import generateUrls from './resolver/generateUrls.js';
import Resolver, { type ResolverOptions } from './resolver/resolver.js';
import './router-config.js';
import { getNotFoundError, isFunction, isObject, isString, log, notFoundResult, toArray } from './resolver/utils.js';
import { ensureRoute, ensureRoutes, fireRouterEvent, logValue } from './routerUtils.js';
import animate from './transitions/animate.js';
import { DEFAULT_TRIGGERS, setNavigationTriggers } from './triggers/navigation.js';
import type {
  ActionResult,
  AnyObject,
  Commands,
  EmptyCommands,
  MaybePromise,
  NavigationTrigger,
  Params,
  PreventAndRedirectCommands,
  PreventCommands,
  PreventResult,
  RedirectContextInfo,
  RedirectResult,
  ResolveContext,
  Route,
  RouteChildrenContext,
  RouteContext,
  RouterLocation,
  WebComponentInterface,
} from './types.js';

const MAX_REDIRECT_COUNT = 256;

function getPathnameForRouter<R extends AnyObject>(pathname: string, resolver: Resolver<R>) {
  // @FIXME: Fix later when we are ready to get rid of the universal-router
  // @ts-expect-error: __effectiveBaseUrl is a private property
  const base = resolver.__effectiveBaseUrl;
  return base ? new URL(pathname.replace(/^\//u, ''), base).pathname : pathname;
}

function getMatchedPath(pathItems: ReadonlyArray<Readonly<{ path: string }>>) {
  return pathItems
    .map((item) => item.path)
    .reduce((a, b) => {
      if (b.length) {
        return `${a.replace(/\/$/u, '')}/${b.replace(/^\//u, '')}`;
      }
      return a;
    }, '');
}

function getRoutePath<R extends AnyObject>(chain: ReadonlyArray<ChainItem<R>>): string {
  return getMatchedPath(chain.map((chainItem) => chainItem.route));
}

function createLocation<R extends AnyObject>(
  {
    chain = [],
    hash = '',
    params = {},
    pathname = '',
    resolver,
    search = '',
    redirectFrom,
  }: Partial<InternalRouteContext<R>>,
  route?: Route<R>,
): RouterLocation<R> {
  const routes = chain.map((item) => item.route as Route<R>);
  return {
    baseUrl: resolver?.baseUrl ?? '',
    getUrl: (userParams = {}) => {
      const _pathname = compile(getRoutePath(chain))({ ...params, ...userParams });
      return resolver ? getPathnameForRouter(_pathname, resolver) : _pathname;
    },
    hash,
    params,
    pathname,
    redirectFrom,
    route: route ?? (routes.length ? routes[routes.length - 1] : undefined) ?? null,
    routes,
    search,
    searchParams: new URLSearchParams(search),
  };
}

function createRedirect<R extends AnyObject>(context: RouteContext<R>, pathname: string): RedirectResult {
  const params = { ...context.params };
  return {
    redirect: {
      from: context.pathname,
      params,
      pathname,
    },
  };
}

function renderElement<R extends AnyObject>(context: InternalRouteContext<R>, element: WebComponentInterface<R>) {
  element.location = createLocation(context);

  if (context.chain) {
    const index = context.chain.map((item) => item.route).indexOf(context.route);
    context.chain[index].element = element;
  }

  return element;
}

function maybeCall<R, A extends unknown[], O extends object>(
  callback: ((this: O, ...args: A) => R) | undefined,
  thisArg: O | undefined,
  ...args: A
): R | undefined {
  if (typeof callback === 'function' && thisArg) {
    return callback.apply(thisArg, args);
  }
}

function amend<
  A extends readonly unknown[],
  N extends keyof E,
  E extends WebComponentInterface & { [key in N]: (this: E, ...args: A) => MaybePromise<ActionResult | undefined> },
>(
  amendmentFunction: keyof E,
  element: E | undefined,
  ...args: A
): (result: ActionResult) => MaybePromise<ActionResult | undefined> {
  return async (amendmentResult: ActionResult) => {
    if (amendmentResult && ('cancel' in amendmentResult || 'redirect' in amendmentResult)) {
      return amendmentResult;
    }

    if (element) {
      return await maybeCall(element[amendmentFunction], element, ...args);
    }
  };
}

function processNewChildren<R extends AnyObject>(
  newChildren: ReadonlyArray<InternalRoute<R>>,
  route: InternalRoute<R>,
) {
  if (!Array.isArray(newChildren) && !isObject(newChildren)) {
    throw new Error(
      log(
        `Incorrect "children" value for the route ${String(route.path)}: expected array or object, but got ${String(
          newChildren,
        )}`,
      ),
    );
  }

  const children = toArray(newChildren);
  children.forEach((child) => ensureRoute(child));
  route.__children = children;
}

function prevent(): PreventResult {
  return { cancel: true };
}

const rootContext: InternalRouteContext<AnyObject> = {
  __renderId: -1,
  params: {},
  route: {
    __synthetic: true,
    children: [],
    path: '',
    action() {
      return undefined;
    },
  },
  pathname: '',
  // eslint-disable-next-line @typescript-eslint/require-await
  async next() {
    return notFoundResult;
  },
};

/**
 * A simple client-side router for single-page applications. It uses
 * express-style middleware and has a first-class support for Web Components and
 * lazy-loading. Works great in Polymer and non-Polymer apps.
 *
 * Use `new Router(outlet, options)` to create a new Router instance.
 *
 * * The `outlet` parameter is a reference to the DOM node to render
 *   the content into.
 *
 * * The `options` parameter is an optional object with options. The following
 *   keys are supported:
 *   * `baseUrl` — the initial value for [
 *     the `baseUrl` property
 *   ](#/classes/Router#property-baseUrl)
 *
 * The Router instance is automatically subscribed to navigation events
 * on `window`.
 *
 * See [Live Examples](#/classes/Router/demos/demo/index.html) for the detailed usage demo and code snippets.
 *
 * See also detailed API docs for the following methods, for the advanced usage:
 *
 * * [setOutlet](#/classes/Router#method-setOutlet) – should be used to configure the outlet.
 * * [setTriggers](#/classes/Router#method-setTriggers) – should be used to configure the navigation events.
 * * [setRoutes](#/classes/Router#method-setRoutes) – should be used to configure the routes.
 *
 * Only `setRoutes` has to be called manually, others are automatically invoked when creating a new instance.
 *
 * @demo demo/index.html
 * @summary JavaScript class that renders different DOM content depending on
 *    a given path. It can re-render when triggered or automatically on
 *    'popstate' and / or 'click' events.
 */
export class Router<R extends AnyObject = EmptyObject> extends Resolver<R> {
  /**
   * Contains read-only information about the current router location:
   * pathname, active routes, parameters. See the
   * [Location type declaration](#/classes/RouterLocation)
   * for more details.
   */
  location: RouterLocation<R> = createLocation({ resolver: this });

  /**
   * A promise that is settled after the current render cycle completes. If
   * there is no render cycle in progress the promise is immediately settled
   * with the last render cycle result.
   */
  ready: Promise<RouterLocation<R>> = Promise.resolve(this.location);

  private readonly __addedByRouter = new WeakSet<Element>();
  private readonly __createdByRouter = new WeakSet<Element>();
  private readonly __navigationEventHandler = this.__onNavigationEvent.bind(this);

  private __lastStartedRenderId = 0;
  private __outlet: ParentNode | null | undefined;
  private __previousContext?: InternalRouteContext<R>;

  private __urlForName?: ReturnType<typeof generateUrls>;

  private __appearingContent: Element[] | null = null;
  private __disappearingContent: Element[] | null = null;

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
  constructor(outlet?: ParentNode | null, options?: ResolverOptions<R>) {
    const baseElement = document.head.querySelector('base');
    const baseHref = baseElement?.getAttribute('href');
    super([], {
      baseUrl: baseHref ? new URL(baseHref, document.URL).href.replace(/[^/]*$/u, '') : undefined,
      ...options,
      resolveRoute: async (context) => await this.__resolveRoute(context),
    });

    setNavigationTriggers(Object.values(DEFAULT_TRIGGERS));

    this.setOutlet(outlet);
    this.subscribe();
  }

  private async __resolveRoute(context: RouteContext<R>): Promise<InternalNextResult<R>> {
    const { route } = context;

    if (isFunction(route.children)) {
      let children = await route.children({ ...context, next: undefined } as RouteChildrenContext<R>);

      // The route.children() callback might have re-written the
      // route.children property instead of returning a value
      if (!isFunction(route.children)) {
        // eslint-disable-next-line no-param-reassign
        ({ children } = route);
      }
      processNewChildren(children, route);
    }

    const commands: Commands = {
      component: (component: string) => {
        const element = document.createElement(component);
        this.__createdByRouter.add(element);
        return element;
      },
      prevent,
      redirect: (path) => createRedirect(context, path),
    };

    return await Promise.resolve()
      .then(async () => {
        if (this.__isLatestRender(context)) {
          return await maybeCall(route.action, route, context, commands);
        }
      })
      .then((result) => {
        if (result != null && typeof result === 'object') {
          // Actions like `() => import('my-view.js')` are not expected to
          // end the resolution, despite the result is not empty. Checking
          // the result with a whitelist of values that end the resolution.
          if (result instanceof HTMLElement || 'redirect' in result || result === notFoundResult) {
            return result;
          }
        }

        if (isString(route.redirect)) {
          return commands.redirect(route.redirect);
        }
      })
      .then((result) => {
        if (result != null) {
          return result;
        }
        if (isString(route.component)) {
          return commands.component(route.component);
        }
      });
  }

  /**
   * Sets the router outlet (the DOM node where the content for the current
   * route is inserted). Any content pre-existing in the router outlet is
   * removed at the end of each render pass.
   *
   * @remarks
   * This method is automatically invoked first time when creating a new Router
   * instance.
   *
   * @param outlet - the DOM node where the content for the current route is
   * inserted.
   */
  setOutlet(outlet?: ParentNode | null): void {
    if (outlet) {
      this.__ensureOutlet(outlet);
    }
    this.__outlet = outlet;
  }

  /**
   * Returns the current router outlet. The initial value is `undefined`.
   *
   * @returns the current router outlet (or `undefined`)
   */
  getOutlet(): ParentNode | null | undefined {
    return this.__outlet;
  }

  /**
   * Sets the routing config (replacing the existing one) and triggers a
   * navigation event so that the router outlet is refreshed according to the
   * current `window.location` and the new routing config.
   *
   * Each route object may have the following properties, listed here in the processing order:
   * * `path` – the route path (relative to the parent route if any) in the
   * [express.js syntax](https://expressjs.com/en/guide/routing.html#route-paths).
   *
   * * `children` – an array of nested routes or a function that provides this
   * array at the render time. The function can be synchronous or asynchronous:
   * in the latter case the render is delayed until the returned promise is
   * resolved. The `children` function is executed every time when this route is
   * being rendered. This allows for dynamic route structures (e.g. backend-defined),
   * but it might have a performance impact as well. In order to avoid calling
   * the function on subsequent renders, you can override the `children` property
   * of the route object and save the calculated array there
   * (via `context.route.children = [ route1, route2, ...];`).
   * Parent routes are fully resolved before resolving the children. Children
   * 'path' values are relative to the parent ones.
   *
   * * `action` – the action that is executed before the route is resolved.
   * The value for this property should be a function, accepting `context`
   * and `commands` parameters described below. If present, this function is
   * always invoked first, disregarding of the other properties' presence.
   * The action can return a result directly or within a `Promise`, which
   * resolves to the result. If the action result is an `HTMLElement` instance,
   * a `commands.component(name)` result, a `commands.redirect(path)` result,
   * or a `context.next()` result, the current route resolution is finished,
   * and other route config properties are ignored.
   * See also **Route Actions** section in [Live Examples](#/classes/Router/demos/demo/index.html).
   *
   * * `redirect` – other route's path to redirect to. Passes all route parameters to the redirect target.
   * The target route should also be defined.
   * See also **Redirects** section in [Live Examples](#/classes/Router/demos/demo/index.html).
   *
   * * `component` – the tag name of the Web Component to resolve the route to.
   * The property is ignored when either an `action` returns the result or `redirect` property is present.
   * If route contains the `component` property (or an action that return a component)
   * and its child route also contains the `component` property, child route's component
   * will be rendered as a light dom child of a parent component.
   *
   * * `name` – the string name of the route to use in the
   * [`router.urlForName(name, params)`](#/classes/Router#method-urlForName)
   * navigation helper method.
   *
   * For any route function (`action`, `children`) defined, the corresponding `route` object is available inside the
   * callback through the `this` reference. If you need to access it, make sure you define the callback as a non-arrow
   * function because arrow functions do not have their own `this` reference.
   *
   * `context` object that is passed to `action` function holds the following properties:
   * * `context.pathname` – string with the pathname being resolved
   *
   * * `context.search` – search query string
   *
   * * `context.hash` – hash string
   *
   * * `context.params` – object with route parameters
   *
   * * `context.route` – object that holds the route that is currently being rendered.
   *
   * * `context.next()` – function for asynchronously getting the next route
   * contents from the resolution chain (if any)
   *
   * `commands` object that is passed to `action` function has
   * the following methods:
   *
   * * `commands.redirect(path)` – function that creates a redirect data
   * for the path specified.
   *
   * * `commands.component(component)` – function that creates a new HTMLElement
   * with current context. Note: the component created by this function is reused if visiting the same path twice in
   * row.
   *
   * @param routes - a single route or an array of those
   * @param skipRender - configure the router but skip rendering the
   *     route corresponding to the current `window.location` values
   */
  override async setRoutes(routes: Route<R> | ReadonlyArray<Route<R>>, skipRender = false): Promise<RouterLocation<R>> {
    this.__previousContext = undefined;
    this.__urlForName = undefined;
    ensureRoutes(routes);
    super.setRoutes(routes);
    if (!skipRender) {
      this.__onNavigationEvent();
    }
    return await this.ready;
  }

  override addRoutes(routes: Route<R> | ReadonlyArray<Route<R>>) {
    ensureRoutes(routes);
    super.addRoutes(routes);
  }

  declare ['resolve']: (context: InternalRouteContext<R>) => Promise<InternalNextResult<R>>;

  /**
   * Asynchronously resolves the given pathname and renders the resolved route
   * component into the router outlet. If no router outlet is set at the time of
   * calling this method, or at the time when the route resolution is completed,
   * a `TypeError` is thrown.
   *
   * Returns a promise that is fulfilled with the router outlet DOM Node after
   * the route component is created and inserted into the router outlet, or
   * rejected if no route matches the given path.
   *
   * If another render pass is started before the previous one is completed, the
   * result of the previous render pass is ignored.
   *
   * @param pathnameOrContext - the pathname to render or a context object with
   * a `pathname` property, optional `search` and `hash` properties, and other
   * properties to pass to the resolver.
   * @param shouldUpdateHistory - update browser history with the rendered
   * location
   */
  async render(
    pathnameOrContext: string | ResolveContext,
    shouldUpdateHistory: boolean = false,
  ): Promise<RouterLocation<R>> {
    this.__lastStartedRenderId += 1;
    const renderId = this.__lastStartedRenderId;
    const context = {
      ...(rootContext as InternalRouteContext<R>),
      ...(isString(pathnameOrContext) ? { hash: '', search: '', pathname: pathnameOrContext } : pathnameOrContext),
      __renderId: renderId,
    } satisfies InternalRouteContext<R>;

    this.ready = this.#doRender(context, shouldUpdateHistory);
    return await this.ready;
  }

  async #doRender(context: InternalRouteContext<R>, shouldUpdateHistory: boolean) {
    const { __renderId } = context;
    try {
      // Find the first route that resolves to a non-empty result
      const internalContext = await this.resolve(context);

      // Process the result of this.resolve() and handle all special commands:
      // (redirect / prevent / component). If the result is a 'component',
      // then go deeper and build the entire chain of nested components matching
      // the pathname. Also call all 'on before' callbacks along the way.
      const contextWithChain = await this.__fullyResolveChain(internalContext);

      if (!this.__isLatestRender(contextWithChain)) {
        return this.location;
      }

      const previousContext = this.__previousContext;

      // Check if the render was prevented and make an early return in that case
      if (contextWithChain === previousContext) {
        // Replace the history with the previous context
        // to make sure the URL stays the same.
        this.__updateBrowserHistory(previousContext, true);
        return this.location;
      }

      this.location = createLocation(contextWithChain);

      if (shouldUpdateHistory) {
        // Replace only if first render redirects, so that we don’t leave
        // the redirecting record in the history
        this.__updateBrowserHistory(contextWithChain, __renderId === 1);
      }

      fireRouterEvent('location-changed', {
        router: this,
        location: this.location,
      });

      // Skip detaching/re-attaching there are no render changes
      if (contextWithChain.__skipAttach) {
        this.__copyUnchangedElements(contextWithChain, previousContext);
        this.__previousContext = contextWithChain;
        return this.location;
      }

      this.__addAppearingContent(contextWithChain, previousContext);
      const animationDone = this.__animateIfNeeded(contextWithChain);

      this.__runOnAfterEnterCallbacks(contextWithChain);
      this.__runOnAfterLeaveCallbacks(contextWithChain, previousContext);

      await animationDone;

      if (this.__isLatestRender(contextWithChain)) {
        // If there is another render pass started after this one,
        // the 'disappearing content' would be removed when the other
        // render pass calls `this.__addAppearingContent()`
        this.__removeDisappearingContent();

        this.__previousContext = contextWithChain;
        return this.location;
      }
    } catch (error: unknown) {
      if (__renderId === this.__lastStartedRenderId) {
        if (shouldUpdateHistory) {
          this.__updateBrowserHistory(this.context);
        }
        Router.__removeDomNodes(this.__outlet?.children);
        this.location = createLocation(Object.assign(context, { resolver: this }));
        fireRouterEvent('error', {
          router: this,
          error,
          ...context,
        });
        throw error;
      }
    }

    return this.location;
  }

  // `topOfTheChainContextBeforeRedirects` is a context coming from Resolver.resolve().
  // It would contain a 'redirect' route or the first 'component' route that
  // matched the pathname. There might be more child 'component' routes to be
  // resolved and added into the chain. This method would find and add them.
  // `contextBeforeRedirects` is the context containing such a child component
  // route. It's only necessary when this method is called recursively (otherwise
  // it's the same as the 'top of the chain' context).
  //
  // Apart from building the chain of child components, this method would also
  // handle 'redirect' routes, call 'onBefore' callbacks and handle 'prevent'
  // and 'redirect' callback results.
  async __fullyResolveChain(
    topOfTheChainContextBeforeRedirects: InternalRouteContext<R>,
    contextBeforeRedirects: InternalRouteContext<R> = topOfTheChainContextBeforeRedirects,
  ): Promise<InternalRouteContext<R>> {
    const contextAfterRedirects = await this.__findComponentContextAfterAllRedirects(contextBeforeRedirects);

    const redirectsHappened = contextAfterRedirects !== contextBeforeRedirects;
    const topOfTheChainContextAfterRedirects = redirectsHappened
      ? contextAfterRedirects
      : topOfTheChainContextBeforeRedirects;

    const matchedPath = getPathnameForRouter(getMatchedPath(contextAfterRedirects.chain ?? []), this);
    const isFound = matchedPath === contextAfterRedirects.pathname;

    // Recursive method to try matching more child and sibling routes
    const findNextContextIfAny = async (
      context: InternalRouteContext<R>,
      parent: InternalRoute<R> | undefined = context.route,
      prevResult?: ActionResult | null,
    ): Promise<InternalNextResult<R>> => {
      const nextContext = await context.next(false, parent, prevResult);

      if (nextContext === null || nextContext === notFoundResult) {
        // Next context is not found in children, ...
        if (isFound) {
          // ...but original context is already fully matching - use it
          return context;
        } else if (parent.parent != null) {
          // ...and there is no full match yet - step up to check siblings
          return await findNextContextIfAny(context, parent.parent, nextContext);
        }
        return nextContext;
      }

      return nextContext;
    };

    const nextContext = await findNextContextIfAny(contextAfterRedirects);

    if (nextContext == null || nextContext === notFoundResult) {
      throw getNotFoundError(topOfTheChainContextAfterRedirects);
    }

    return nextContext && nextContext !== notFoundResult && nextContext !== contextAfterRedirects
      ? await this.__fullyResolveChain(topOfTheChainContextAfterRedirects, nextContext)
      : await this.__amendWithOnBeforeCallbacks(contextAfterRedirects);
  }

  private async __findComponentContextAfterAllRedirects(
    context: InternalRouteContext<R>,
  ): Promise<InternalRouteContext<R>> {
    const { result } = context;
    if (result instanceof HTMLElement) {
      renderElement(context, result as WebComponentInterface<R>);
      return context;
    } else if (result && 'redirect' in result) {
      const ctx = await this.__redirect(result.redirect, context.__redirectCount, context.__renderId);
      return await this.__findComponentContextAfterAllRedirects(ctx);
    }

    throw result instanceof Error
      ? result
      : new Error(
          log(
            `Invalid route resolution result for path "${context.pathname}". ` +
              `Expected redirect object or HTML element, but got: "${logValue(result)}". ` +
              `Double check the action return value for the route.`,
          ),
        );
  }

  private async __amendWithOnBeforeCallbacks(
    contextWithFullChain: InternalRouteContext<R>,
  ): Promise<InternalRouteContext<R>> {
    return await this.__runOnBeforeCallbacks(contextWithFullChain).then(async (amendedContext) => {
      if (amendedContext === this.__previousContext || amendedContext === contextWithFullChain) {
        return amendedContext;
      }
      return await this.__fullyResolveChain(amendedContext);
    });
  }

  private async __runOnBeforeCallbacks(newContext: InternalRouteContext<R>): Promise<InternalRouteContext<R>> {
    const previousContext = (this.__previousContext ?? {}) as Partial<InternalRouteContext<R>>;
    const previousChain = previousContext.chain ?? [];
    const newChain = newContext.chain ?? [];

    let callbacks: Promise<ActionResult> = Promise.resolve(undefined);
    const redirect = (pathname: string) => createRedirect(newContext, pathname) as unknown as RedirectResult;

    newContext.__divergedChainIndex = 0;
    newContext.__skipAttach = false;
    if (previousChain.length) {
      for (let i = 0; i < Math.min(previousChain.length, newChain.length); newContext.__divergedChainIndex++, i++) {
        if (
          previousChain[i].route !== newChain[i].route ||
          (previousChain[i].path !== newChain[i].path && previousChain[i].element !== newChain[i].element) ||
          !this.__isReusableElement(previousChain[i].element, newChain[i].element)
        ) {
          break;
        }
      }

      // Skip re-attaching and notifications if element and chain do not change
      newContext.__skipAttach =
        // Same route chain
        newChain.length === previousChain.length &&
        newContext.__divergedChainIndex === newChain.length &&
        // Same element
        this.__isReusableElement(newContext.result, previousContext.result);

      if (newContext.__skipAttach) {
        // execute onBeforeLeave for changed segment element when skipping attach
        for (let i = newChain.length - 1; i >= 0; i--) {
          callbacks = this.__runOnBeforeLeaveCallbacks(callbacks, newContext, { prevent }, previousChain[i]);
        }
        // execute onBeforeEnter for changed segment element when skipping attach
        for (let i = 0; i < newChain.length; i++) {
          callbacks = this.__runOnBeforeEnterCallbacks(
            callbacks,
            newContext,
            {
              prevent,
              redirect,
            },
            newChain[i],
          );
          previousChain[i].element!.location = createLocation(newContext, previousChain[i].route);
        }
      } else {
        // execute onBeforeLeave when NOT skipping attach
        for (let i = previousChain.length - 1; i >= newContext.__divergedChainIndex; i--) {
          callbacks = this.__runOnBeforeLeaveCallbacks(callbacks, newContext, { prevent }, previousChain[i]);
        }
      }
    }
    // execute onBeforeEnter when NOT skipping attach
    if (!newContext.__skipAttach) {
      for (let i = 0; i < newChain.length; i++) {
        if (i < newContext.__divergedChainIndex) {
          if (i < previousChain.length && previousChain[i].element) {
            (previousChain[i].element as WebComponentInterface).location = createLocation(
              newContext,
              previousChain[i].route,
            );
          }
        } else {
          callbacks = this.__runOnBeforeEnterCallbacks(
            callbacks,
            newContext,
            {
              prevent,
              redirect,
            },
            newChain[i],
          );
          if (newChain[i].element) {
            (newChain[i].element as WebComponentInterface).location = createLocation(newContext, newChain[i].route);
          }
        }
      }
    }
    return await callbacks.then(async (amendmentResult: ActionResult) => {
      if (amendmentResult) {
        if ('cancel' in amendmentResult && this.__previousContext) {
          this.__previousContext.__renderId = newContext.__renderId;
          return this.__previousContext;
        }
        if ('redirect' in amendmentResult) {
          return await this.__redirect(amendmentResult.redirect, newContext.__redirectCount, newContext.__renderId);
        }
      }
      return newContext;
    });
  }

  private async __runOnBeforeLeaveCallbacks(
    callbacks: Promise<ActionResult>,
    newContext: InternalRouteContext<R>,
    commands: PreventCommands,
    chainElement: ChainItem<R>,
  ): Promise<ActionResult> {
    const location = createLocation(newContext);

    let result: ResolveResult<R> | undefined;

    if (this.__isLatestRender(newContext)) {
      const beforeLeaveFunction = amend('onBeforeLeave', chainElement.element, location, commands, this);

      result = (await beforeLeaveFunction(await callbacks)) as ResolveResult<R> | undefined;
    }

    if (result && !('redirect' in (result as object))) {
      return result as ActionResult;
    }
  }

  private async __runOnBeforeEnterCallbacks(
    callbacks: Promise<ActionResult>,
    newContext: InternalRouteContext<R>,
    commands: PreventAndRedirectCommands,
    chainElement: ChainItem<R>,
  ): Promise<ActionResult> {
    const location = createLocation(newContext, chainElement.route);
    const result = await callbacks;

    if (this.__isLatestRender(newContext)) {
      const beforeEnterFunction = amend('onBeforeEnter', chainElement.element, location, commands, this);

      return beforeEnterFunction(result) as ActionResult;
    }
  }

  private __isReusableElement(element?: ActionResult, otherElement?: ActionResult): boolean {
    if (element instanceof Element && otherElement instanceof Element) {
      return this.__createdByRouter.has(element) && this.__createdByRouter.has(otherElement)
        ? element.localName === otherElement.localName
        : element === otherElement;
    }
    return false;
  }

  private __isLatestRender(context: Partial<InternalRouteContext<R>>): boolean {
    return context.__renderId === this.__lastStartedRenderId;
  }

  private async __redirect(
    redirectData: RedirectContextInfo,
    counter: number = 0,
    renderId: number = 0,
  ): Promise<InternalRouteContext<R> & RedirectContextInfo> {
    if (counter > MAX_REDIRECT_COUNT) {
      throw new Error(log(`Too many redirects when rendering ${redirectData.from}`));
    }

    return await this.resolve({
      ...rootContext,
      pathname: this.urlForPath(redirectData.pathname, redirectData.params),
      redirectFrom: redirectData.from,
      __redirectCount: counter + 1,
      __renderId: renderId,
    });
  }

  private __ensureOutlet(outlet: ParentNode | undefined | null = this.__outlet): void {
    if (!(outlet instanceof Node)) {
      throw new TypeError(log(`Expected router outlet to be a valid DOM Node (but got ${outlet})`));
    }
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private __updateBrowserHistory({ pathname, search = '', hash = '' }: ResolveContext, replace?: boolean): void {
    if (window.location.pathname !== pathname || window.location.search !== search || window.location.hash !== hash) {
      const changeState = replace ? 'replaceState' : 'pushState';
      window.history[changeState](null, document.title, pathname + search + hash);
      window.dispatchEvent(new PopStateEvent('popstate', { state: 'vaadin-router-ignore' }));
    }
  }

  private __copyUnchangedElements(
    context: InternalRouteContext<R>,
    previousContext?: InternalRouteContext<R>,
  ): ParentNode | null | undefined {
    // Find the deepest common parent between the last and the new component
    // chains. Update references for the unchanged elements in the new chain
    let deepestCommonParent = this.__outlet;
    for (let i = 0; i < (context.__divergedChainIndex ?? 0); i++) {
      const unchangedElement = previousContext?.chain?.[i].element;
      if (unchangedElement) {
        if (unchangedElement.parentNode === deepestCommonParent) {
          context.chain![i].element = unchangedElement;
          deepestCommonParent = unchangedElement;
        } else {
          break;
        }
      }
    }
    return deepestCommonParent;
  }

  private __addAppearingContent(context: InternalRouteContext<R>, previousContext?: InternalRouteContext<R>): void {
    this.__ensureOutlet();

    // If the previous 'entering' animation has not completed yet,
    // stop it and remove that content from the DOM before adding new one.
    this.__removeAppearingContent();

    // Copy reusable elements from the previousContext to current
    const deepestCommonParent = this.__copyUnchangedElements(context, previousContext);

    // Keep two lists of DOM elements:
    //  - those that should be removed once the transition animation is over
    //  - and those that should remain
    this.__appearingContent = [];
    this.__disappearingContent = Array.from(deepestCommonParent?.children ?? []).filter(
      // Only remove layout content that was added by router
      (e) =>
        this.__addedByRouter.has(e) &&
        // Do not remove the result element to avoid flickering
        e !== context.result,
    );

    // Add new elements (starting after the deepest common parent) to the DOM.
    // That way only the components that are actually different between the two
    // locations are added to the DOM (and those that are common remain in the
    // DOM without first removing and then adding them again).
    let parentElement = deepestCommonParent;
    for (let i = context.__divergedChainIndex ?? 0; i < (context.chain?.length ?? 0); i++) {
      const elementToAdd = context.chain![i].element;
      if (elementToAdd) {
        parentElement?.appendChild(elementToAdd);
        this.__addedByRouter.add(elementToAdd);
        if (parentElement === deepestCommonParent) {
          this.__appearingContent.push(elementToAdd);
        }
        parentElement = elementToAdd;
      }
    }
  }

  private __removeDisappearingContent(): void {
    if (this.__disappearingContent) {
      Router.__removeDomNodes(this.__disappearingContent);
    }
    this.__disappearingContent = null;
    this.__appearingContent = null;
  }

  private __removeAppearingContent(): void {
    if (this.__disappearingContent && this.__appearingContent) {
      Router.__removeDomNodes(this.__appearingContent);
      this.__disappearingContent = null;
      this.__appearingContent = null;
    }
  }

  private __runOnAfterLeaveCallbacks(
    currentContext: InternalRouteContext<R>,
    targetContext?: InternalRouteContext<R>,
  ): void {
    if (!targetContext?.chain || currentContext.__divergedChainIndex == null) {
      return;
    }

    // REVERSE iteration: from Z to A
    for (let i = targetContext.chain.length - 1; i >= currentContext.__divergedChainIndex; i--) {
      if (!this.__isLatestRender(currentContext)) {
        break;
      }
      const currentComponent = targetContext.chain[i].element;
      if (!currentComponent) {
        continue;
      }
      try {
        const location = createLocation(currentContext);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        maybeCall(currentComponent.onAfterLeave, currentComponent, location, {} as EmptyCommands, this);
      } finally {
        if ((this.__disappearingContent ?? []).includes(currentComponent)) {
          Router.__removeDomNodes(currentComponent.children);
        }
      }
    }
  }

  private __runOnAfterEnterCallbacks(currentContext: InternalRouteContext<R>): void {
    if (!currentContext.chain || currentContext.__divergedChainIndex == null) {
      return;
    }

    // forward iteration: from A to Z
    for (let i = currentContext.__divergedChainIndex; i < currentContext.chain.length; i++) {
      if (!this.__isLatestRender(currentContext)) {
        break;
      }
      const currentComponent = currentContext.chain[i].element;
      if (currentComponent) {
        const location = createLocation(currentContext, currentContext.chain[i].route);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        maybeCall(currentComponent.onAfterEnter, currentComponent, location, {}, this);
      }
    }
  }

  private async __animateIfNeeded(context: InternalRouteContext<R>): Promise<InternalRouteContext<R>> {
    const from = this.__disappearingContent?.[0];
    const to = this.__appearingContent?.[0];
    const promises = [];

    const { chain = [] } = context;
    let config;
    for (let i = chain.length - 1; i >= 0; i--) {
      if (chain[i].route.animate) {
        config = chain[i].route.animate;
        break;
      }
    }

    if (from && to && config) {
      const leave = isObject(config) && config.leave ? config.leave : 'leaving';
      const enter = isObject(config) && config.enter ? config.enter : 'entering';
      promises.push(animate(from, leave));
      promises.push(animate(to, enter));
    }

    await Promise.all(promises);

    return context;
  }

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

  private __onNavigationEvent(event?: Event): void {
    const { pathname, search, hash } =
      event instanceof CustomEvent ? (event.detail as ResolveContext) : window.location;

    if (isString(this.__normalizePathname(pathname))) {
      if (event?.preventDefault) {
        event.preventDefault();
      }
      // eslint-disable-next-line no-void
      void this.render({ pathname, search, hash }, true);
    }
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
    if (!this.__urlForName) {
      this.__urlForName = generateUrls(this, {
        cacheKeyProvider(route): string | undefined {
          return 'component' in route && typeof route.component === 'string'
            ? (route as Readonly<{ component: string }>).component
            : undefined;
        },
      });
    }
    return getPathnameForRouter(this.__urlForName(name, params ?? undefined), this);
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
  urlForPath(path: string, params?: Params | null): string {
    return getPathnameForRouter(compile(path)(params ?? undefined), this);
  }

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
  static go(path: string | ResolveContext): boolean {
    const { pathname, search, hash } = isString(path)
      ? new URL(path, 'http://a') // some base to omit origin
      : path;
    return fireRouterEvent('go', { pathname, search, hash });
  }

  static __removeDomNodes(nodes?: readonly Element[] | HTMLCollection | null): void {
    if (nodes?.length) {
      const parent = nodes[0].parentNode;
      const childrenCount = nodes.length - 1;

      for (let i = childrenCount; i >= 0; i--) {
        parent?.removeChild(nodes[i]);
      }
    }
  }
}

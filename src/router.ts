import { compile } from 'path-to-regexp';
import Resolver from './resolver/resolver.js';
import generateUrls from './resolver/generateUrls.js';
import setNavigationTriggers, * as setNavigationTriggersModule from './triggers/setNavigationTriggers.js';
import animate from './transitions/animate.js';
import {
  ensureRoute,
  fireRouterEvent,
  log,
  logValue,
  toArray,
  isFunction,
  isString,
  isObject,
  getNotFoundError,
  notFoundResult,
  type ContextWithChain,
  type ChainItem,
  type InternalContext,
  type ResolveResult,
} from './utils.js';
import type { RouterLocation } from './documentation/location.js';
import type {
  ActionResult,
  ChildrenFn,
  Commands,
  ComponentResult,
  Context,
  InternalRoute,
  NotFoundResult,
  PreventResult,
  RedirectResult,
  Route,
} from './types/route.js';
import type { Params } from './types/params.js';
import type {
  WebComponentInterface,
  AfterEnterObserver,
  AfterLeaveObserver,
  BeforeEnterObserver,
  BeforeLeaveObserver,
  EmptyCommands,
  PreventCommands,
  PreventAndRedirectCommands,
} from './types/observers.js';
import POPSTATE from './triggers/popstate.js';
import CLICK from './triggers/click.js';
import { NavigationTrigger } from './triggers/NavigationTrigger.js';

export { NavigationTrigger } from './triggers/NavigationTrigger.js';

export type {
  ActionResult,
  ChildrenFn,
  Commands,
  ComponentResult,
  Context,
  NotFoundResult,
  PreventResult,
  RedirectResult,
  Route,
  RouterLocation,
  WebComponentInterface,
  AfterEnterObserver,
  AfterLeaveObserver,
  BeforeEnterObserver,
  BeforeLeaveObserver,
  EmptyCommands,
  PreventCommands,
  PreventAndRedirectCommands,
};

const MAX_REDIRECT_COUNT = 10;

function isResultNotEmpty(result?: unknown | undefined | null): boolean {
  return result !== null && result !== undefined;
}

function copyContextWithoutNext(context: Context): Omit<Context, 'next'> {
  const copy: Omit<Context, 'next'> = Object.assign({}, context);
  delete (copy as typeof copy & { next?: Context['next'] }).next;
  return copy;
}

function createLocation(context: Partial<ContextWithChain>, route?: InternalRoute): RouterLocation {
  const { pathname = '', search = '', hash = '', chain = [] as ChainItem[], params = {} as Params, resolver } = context;
  const routes: InternalRoute[] = chain.map((item) => item.route);
  const baseUrl = resolver ? resolver.baseUrl : '';
  return {
    baseUrl,
    pathname: pathname || '',
    search: search || '',
    hash: hash || '',
    route: route || null,
    routes,
    params,
    searchParams: new URLSearchParams(search),
    getUrl: (userParams?: Params) => {
      const pathname: string = compile(getMatchedPath(chain))(Object.assign({}, params, userParams));
      return resolver ? getPathnameForRouter(pathname, resolver) : pathname;
    },
  } as RouterLocation;
}

type CancelMarker = Readonly<{
  cancel: true;
}>;

type RedirectMarker = Readonly<{
  redirect: RedirectContextInfo;
}>;

type ResultMarker = CancelMarker | RedirectMarker | Element | void;

function prevent(): PreventResult {
  return { cancel: true } as unknown as PreventResult;
}

function createRedirect(context: LocationInfo & { params?: Params }, pathname: string): RedirectMarker {
  const params = Object.assign({}, context.params);
  return {
    redirect: {
      pathname,
      from: context.pathname,
      params,
    },
  };
}

function renderElement(context: ContextWithChain, element: Element): Element {
  (element as WebComponentInterface).location = createLocation(context);
  const index = context.chain.map((item) => item.route).indexOf(context.route);
  context.chain![index].element = element;
  return element;
}

function runCallbackIfPossible<TFunction extends (...args: unknown[]) => unknown>(
  callback?: TFunction | unknown,
  args?: Parameters<TFunction>,
  thisArg?: ThisParameterType<TFunction>,
): ReturnType<TFunction> | void {
  if (isFunction(callback)) {
    return callback.apply(thisArg, args);
  }
}

function amend<
  TFunction extends (this: TElement, ...args: unknown[]) => unknown,
  TMethodName extends string & keyof TElement,
  TElement extends Element & WebComponentInterface & { [key in TMethodName]?: TFunction },
>(amendmentFunction: TMethodName, args: Parameters<TFunction>, element?: TElement) {
  return (amendmentResult: ResultMarker) => {
    if (amendmentResult && ('cancel' in amendmentResult || 'redirect' in amendmentResult)) {
      return amendmentResult;
    }

    if (element) {
      const callback = element[amendmentFunction] as TFunction | undefined;
      return runCallbackIfPossible(callback, args, element as ThisParameterType<TFunction>);
    }
  };
}

function processNewChildren(newChildren: Route | Route[], route: InternalRoute): void {
  if (!Array.isArray(newChildren) && !isObject(newChildren)) {
    throw new Error(
      log(`Incorrect "children" value for the route ${route.path}: expected array or object, but got ${newChildren}`),
    );
  }

  route.__children = [];
  const childRoutes = toArray(newChildren);
  for (let i = 0; i < childRoutes.length; i++) {
    ensureRoute(childRoutes[i]);
    route.__children.push(childRoutes[i]);
  }
}

function getPathnameForRouter(pathname: string, router: Resolver): string {
  const base = router.__effectiveBaseUrl;
  return base
    ? (router.constructor as typeof Resolver).__createUrl(pathname.replace(/^\//, ''), base).pathname
    : pathname;
}

function getMatchedPath(chain: ChainItem[]): string {
  return chain
    .map((item) => item.path)
    .reduce((a, b) => {
      if (b.length) {
        return a.replace(/\/$/, '') + '/' + b.replace(/^\//, '');
      }
      return a;
    }, '');
}

export type RouterOptions = Readonly<{
  baseUrl?: string;
}>;

declare global {
  interface WindowEventMap {
    'vaadin-router-location-changed': CustomEvent<{
      router: Router;
      location: RouterLocation;
    }>;
  }
}

export type LocationInfo = Readonly<{
  pathname: string;
  search?: string;
  hash?: string;
}>;

type RedirectContextInfo = LocationInfo &
  Readonly<{
    params?: Params;
    from?: string;
  }>;

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
 * @summary JavaScript class that renders different DOM content depending on
 *    a given path. It can re-render when triggered or automatically on
 *    'popstate' and / or 'click' events.
 */
export class Router extends Resolver {
  public override readonly resolveRoute = this.__resolveRoute.bind(this);

  /**
   * The base URL for all routes in the router instance. By default,
   * if the base element exists in the `<head>`, vaadin-router
   * takes the `<base href>` attribute value, resolved against the current
   * `document.URL`.
   *
   */
  public declare baseUrl: string;

  /**
   * Contains read-only information about the current router location:
   * pathname, active routes, parameters. See the
   * [Location type declaration](#/classes/RouterLocation)
   * for more details.
   */
  public location: RouterLocation = createLocation({ resolver: this });

  /**
   * A promise that is settled after the current render cycle completes. If
   * there is no render cycle in progress the promise is immediately settled
   * with the last render cycle result.
   *
   * @public
   * @type {!Promise<!RouterLocation>}
   */
  public ready: Promise<RouterLocation> = Promise.resolve(this.location);

  private __lastStartedRenderId: number = 0;
  private __navigationEventHandler = this.__onNavigationEvent.bind(this);

  // Using WeakMap instead of WeakSet because WeakSet is not supported by IE11
  private __createdByRouter = new WeakMap<Element, boolean>();
  private __addedByRouter = new WeakMap<Element, boolean>();

  private __outlet: ParentNode | null | undefined;
  private __previousContext?: ContextWithChain;

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
   * @param outlet the DOM Node to render contents into
   * @param options
   */
  constructor(outlet?: ParentNode | null, options?: RouterOptions) {
    const baseElement = document.head.querySelector('base');
    const baseHref = baseElement && baseElement.getAttribute('href');
    super(
      [],
      Object.assign(
        {
          // Default options
          baseUrl: baseHref && Resolver.__createUrl(baseHref, document.URL).href.replace(/[^/]*$/, ''),
        },
        options,
      ),
    );

    Router.setTriggers(CLICK, POPSTATE);

    this.setOutlet(outlet);
    this.subscribe();
  }

  async __resolveRoute(context: Context): Promise<ActionResult> {
    const route = context.route;

    let callbacks: Promise<ActionResult> = Promise.resolve();

    if (isFunction(route.children)) {
      callbacks = callbacks
        .then(() => (route.children as ChildrenFn)(copyContextWithoutNext(context)))
        .then((children) => {
          // The route.children() callback might have re-written the
          // route.children property instead of returning a value
          if (!isResultNotEmpty(children) && !isFunction(route.children)) {
            children = route.children!;
          }
          processNewChildren(children, route);
        });
    }

    const commands: Commands = {
      prevent,
      redirect: (path: string) => createRedirect(context, path) as unknown as RedirectResult,
      component: (component: string) => {
        const element = document.createElement(component);
        this.__createdByRouter.set(element, true);
        return element as unknown as ComponentResult;
      },
    };

    return callbacks
      .then(() => {
        if (this.__isLatestRender(context as unknown as Partial<InternalContext>)) {
          return runCallbackIfPossible(route.action, [context, commands], route);
        }
      })
      .then((result) => {
        if (isResultNotEmpty(result)) {
          // Actions like `() => import('my-view.js')` are not expected to
          // end the resolution, despite the result is not empty. Checking
          // the result with a whitelist of values that end the resolution.
          if (result instanceof HTMLElement) {
            return result as unknown as ComponentResult;
          }

          if ('redirect' in (result as object)) {
            return result as unknown as RedirectResult;
          }

          if (result === notFoundResult) {
            return result as NotFoundResult;
          }
        }

        if (isString(route.redirect)) {
          return commands.redirect(route.redirect) as RedirectResult;
        }
      })
      .then((result) => {
        if (isResultNotEmpty(result)) {
          return result;
        }
        if (isString(route.component)) {
          return commands.component(route.component) as unknown as HTMLElement;
        }
      });
  }

  /**
   * Sets the router outlet (the DOM node where the content for the current
   * route is inserted). Any content pre-existing in the router outlet is
   * removed at the end of each render pass.
   *
   * NOTE: this method is automatically invoked first time when creating a new Router instance.
   *
   * @param outlet the DOM node where the content for the current route
   *     is inserted.
   */
  setOutlet(outlet?: ParentNode | null) {
    if (outlet) {
      this.__ensureOutlet(outlet);
    }
    this.__outlet = outlet;
  }

  /**
   * Returns the current router outlet. The initial value is `undefined`.
   *
   * @return the current router outlet (or `undefined`)
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
   * [express.js syntax](https://expressjs.com/en/guide/routing.html#route-paths").
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
   * For any route function (`action`, `children`) defined, the corresponding `route` object is available inside the callback
   * through the `this` reference. If you need to access it, make sure you define the callback as a non-arrow function
   * because arrow functions do not have their own `this` reference.
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
   * with current context. Note: the component created by this function is reused if visiting the same path twice in row.
   *
   * @param routes a single route or an array of those
   * @param skipRender configure the router but skip rendering the
   *     route corresponding to the current `window.location` values
   */
  override setRoutes(routes: Route | Route[], skipRender = false): Promise<RouterLocation> {
    this.__previousContext = undefined;
    this.__urlForName = undefined;
    super.setRoutes(routes);
    if (!skipRender) {
      this.__onNavigationEvent();
    }
    return this.ready;
  }

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
   * @param pathnameOrContext
   *    the pathname to render or a context object with a `pathname` property,
   *    optional `search` and `hash` properties, and other properties
   *    to pass to the resolver.
   * @param shouldUpdateHistory
   *    update browser history with the rendered location
   */
  async render(
    pathnameOrContext: string | LocationInfo,
    shouldUpdateHistory: boolean = false,
  ): Promise<RouterLocation> {
    const renderId = ++this.__lastStartedRenderId;
    const context: Required<LocationInfo> = {
      search: '',
      hash: '',
      // @ts-expect-error
      __renderId: renderId,
      ...(isString(pathnameOrContext) ? { pathname: pathnameOrContext } : pathnameOrContext),
    };

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

      const previousContext = this.__previousContext as ContextWithChain;

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
        this.__updateBrowserHistory(contextWithChain, renderId === 1);
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
      if (renderId === this.__lastStartedRenderId) {
        if (shouldUpdateHistory) {
          this.__updateBrowserHistory(context);
        }
        Router.__removeDomNodes(this.__outlet && this.__outlet.children);
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
    topOfTheChainContextBeforeRedirects: InternalContext,
    contextBeforeRedirects: InternalContext = topOfTheChainContextBeforeRedirects,
  ): Promise<ContextWithChain> {
    const contextAfterRedirects = await this.__findComponentContextAfterAllRedirects(contextBeforeRedirects);

    const redirectsHappened = contextAfterRedirects !== contextBeforeRedirects;
    const topOfTheChainContextAfterRedirects = redirectsHappened
      ? contextAfterRedirects
      : topOfTheChainContextBeforeRedirects;

    const matchedPath = getPathnameForRouter(getMatchedPath(contextAfterRedirects.chain), this);
    const isFound = matchedPath === contextAfterRedirects.pathname;

    // Recursive method to try matching more child and sibling routes
    const findNextContextIfAny = async (
      context: InternalContext,
      parent: InternalRoute = context.route,
      prevResult?: ResolveResult,
    ): Promise<InternalContext> => {
      const nextContext = await context.next(false, parent, prevResult);

      if (nextContext === null || nextContext === notFoundResult) {
        // Next context is not found in children, ...
        if (isFound) {
          // ...but original context is already fully matching - use it
          return context;
        } else if (parent.parent !== null) {
          // ...and there is no full match yet - step up to check siblings
          return findNextContextIfAny(context, parent.parent, nextContext);
        } else {
          return nextContext;
        }
      }

      return nextContext;
    };

    return findNextContextIfAny(contextAfterRedirects).then((nextContext) => {
      if (nextContext === null || nextContext === notFoundResult) {
        throw getNotFoundError(topOfTheChainContextAfterRedirects as unknown as Context);
      }

      return nextContext && nextContext !== notFoundResult && nextContext !== contextAfterRedirects
        ? this.__fullyResolveChain(topOfTheChainContextAfterRedirects, nextContext)
        : this.__amendWithOnBeforeCallbacks(contextAfterRedirects);
    });
  }

  async __findComponentContextAfterAllRedirects(context: InternalContext): Promise<ContextWithChain> {
    const result = context.result;
    if (result instanceof HTMLElement) {
      renderElement(context as ContextWithChain, result);
      return context as ContextWithChain;
    } else if ('redirect' in (result as object)) {
      const ctx = await this.__redirect(
        (result as unknown as RedirectMarker).redirect,
        context.__redirectCount,
        context.__renderId,
      );
      return this.__findComponentContextAfterAllRedirects(ctx as InternalContext);
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

  async __amendWithOnBeforeCallbacks(contextWithFullChain: ContextWithChain): Promise<ContextWithChain> {
    return this.__runOnBeforeCallbacks(contextWithFullChain).then((amendedContext) => {
      if (amendedContext === this.__previousContext || amendedContext === contextWithFullChain) {
        return amendedContext as ContextWithChain;
      }
      return this.__fullyResolveChain(amendedContext as InternalContext);
    });
  }

  async __runOnBeforeCallbacks(newContext: ContextWithChain): Promise<InternalContext> {
    const previousContext = (this.__previousContext || {}) as Partial<ContextWithChain>;
    const previousChain = previousContext.chain || [];
    const newChain = newContext.chain;

    let callbacks: Promise<ResultMarker> = Promise.resolve();
    const redirect = (pathname: string) => createRedirect(newContext, pathname) as unknown as RedirectResult;

    newContext.__divergedChainIndex = 0;
    newContext.__skipAttach = false;
    if (previousChain.length) {
      for (let i = 0; i < Math.min(previousChain.length, newChain.length); i = ++newContext.__divergedChainIndex) {
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
        newContext.__divergedChainIndex == newChain.length &&
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
          (previousChain[i].element as WebComponentInterface).location = createLocation(
            newContext,
            previousChain[i].route,
          );
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
    return callbacks.then((amendmentResult: ResultMarker) => {
      if (amendmentResult) {
        if ('cancel' in amendmentResult && this.__previousContext) {
          this.__previousContext.__renderId = newContext.__renderId;
          return this.__previousContext as InternalContext;
        }
        if ('redirect' in amendmentResult) {
          return this.__redirect(amendmentResult.redirect, newContext.__redirectCount, newContext.__renderId);
        }
      }
      return newContext;
    });
  }

  async __runOnBeforeLeaveCallbacks(
    callbacks: Promise<ResultMarker>,
    newContext: ContextWithChain,
    commands: PreventCommands,
    chainElement: ChainItem,
  ): Promise<ResultMarker> {
    const location = createLocation(newContext);

    let result: ResolveResult | undefined;

    if (this.__isLatestRender(newContext)) {
      const beforeLeaveFunction = amend(
        'onBeforeLeave',
        [location, commands, this],
        chainElement.element as Element & Partial<BeforeLeaveObserver>,
      );

      result = (await beforeLeaveFunction(await callbacks)) as ResolveResult | undefined;
    }

    if (result && !('redirect' in (result as object))) {
      return result as ResultMarker;
    }
  }

  async __runOnBeforeEnterCallbacks(
    callbacks: Promise<ResultMarker>,
    newContext: ContextWithChain,
    commands: PreventAndRedirectCommands,
    chainElement: ChainItem,
  ): Promise<ResultMarker> {
    const location = createLocation(newContext, chainElement.route);
    const result = await callbacks;

    if (this.__isLatestRender(newContext)) {
      const beforeEnterFunction = amend(
        'onBeforeEnter',
        [location, commands, this],
        chainElement.element as Element & Partial<BeforeEnterObserver>,
      );

      return beforeEnterFunction(result) as ResultMarker;
    }
  }

  __isReusableElement(element?: Element | unknown, otherElement?: Element | unknown): boolean {
    if (element instanceof Element && otherElement instanceof Element) {
      return this.__createdByRouter.get(element) && this.__createdByRouter.get(otherElement)
        ? element.localName === otherElement.localName
        : element === otherElement;
    }
    return false;
  }

  __isLatestRender(context: Partial<InternalContext>): boolean {
    return context.__renderId === this.__lastStartedRenderId;
  }

  async __redirect(
    redirectData: RedirectContextInfo,
    counter: number = 0,
    renderId: number = 0,
  ): Promise<InternalContext & RedirectContextInfo> {
    if (counter > MAX_REDIRECT_COUNT) {
      throw new Error(log(`Too many redirects when rendering ${redirectData.from}`));
    }

    return this.resolve({
      pathname: this.urlForPath(redirectData.pathname, redirectData.params),
      redirectFrom: redirectData.from,
      __redirectCount: counter + 1,
      __renderId: renderId,
    } as RedirectContextInfo);
  }

  __ensureOutlet(outlet: ParentNode | undefined | null = this.__outlet): void {
    if (!(outlet instanceof Node)) {
      throw new TypeError(log(`Expected router outlet to be a valid DOM Node (but got ${outlet})`));
    }
  }

  __updateBrowserHistory({ pathname, search = '', hash = '' }: LocationInfo, replace?: boolean): void {
    if (window.location.pathname !== pathname || window.location.search !== search || window.location.hash !== hash) {
      const changeState = replace ? 'replaceState' : 'pushState';
      window.history[changeState](null, document.title, pathname + search + hash);
      window.dispatchEvent(new PopStateEvent('popstate', { state: 'vaadin-router-ignore' }));
    }
  }

  __copyUnchangedElements(context: ContextWithChain, previousContext: ContextWithChain): Element {
    // Find the deepest common parent between the last and the new component
    // chains. Update references for the unchanged elements in the new chain
    let deepestCommonParent = this.__outlet as Element;
    for (let i = 0; i < context.__divergedChainIndex; i++) {
      const unchangedElement = previousContext && previousContext.chain[i].element;
      if (unchangedElement) {
        if (unchangedElement.parentNode === deepestCommonParent) {
          context.chain[i].element = unchangedElement;
          deepestCommonParent = unchangedElement;
        } else {
          break;
        }
      }
    }
    return deepestCommonParent;
  }

  __addAppearingContent(context: ContextWithChain, previousContext: ContextWithChain): void {
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
    this.__disappearingContent = Array.from(deepestCommonParent.children).filter(
      // Only remove layout content that was added by router
      (e) =>
        this.__addedByRouter.get(e) &&
        // Do not remove the result element to avoid flickering
        e !== context.result,
    );

    // Add new elements (starting after the deepest common parent) to the DOM.
    // That way only the components that are actually different between the two
    // locations are added to the DOM (and those that are common remain in the
    // DOM without first removing and then adding them again).
    let parentElement = deepestCommonParent;
    for (let i = context.__divergedChainIndex; i < context.chain.length; i++) {
      const elementToAdd = context.chain[i].element;
      if (elementToAdd) {
        parentElement.appendChild(elementToAdd);
        this.__addedByRouter.set(elementToAdd, true);
        if (parentElement === deepestCommonParent) {
          this.__appearingContent.push(elementToAdd);
        }
        parentElement = elementToAdd;
      }
    }
  }

  __removeDisappearingContent(): void {
    if (this.__disappearingContent) {
      Router.__removeDomNodes(this.__disappearingContent);
    }
    this.__disappearingContent = null;
    this.__appearingContent = null;
  }

  __removeAppearingContent(): void {
    if (this.__disappearingContent && this.__appearingContent) {
      Router.__removeDomNodes(this.__appearingContent);
      this.__disappearingContent = null;
      this.__appearingContent = null;
    }
  }

  __runOnAfterLeaveCallbacks(currentContext: ContextWithChain, targetContext: ContextWithChain): void {
    if (!targetContext) {
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
        runCallbackIfPossible(
          (currentComponent as Partial<AfterLeaveObserver>).onAfterLeave,
          [location, {} as EmptyCommands, this],
          currentComponent,
        );
      } finally {
        if ((this.__disappearingContent || []).indexOf(currentComponent) > -1) {
          Router.__removeDomNodes(currentComponent.children);
        }
      }
    }
  }

  __runOnAfterEnterCallbacks(currentContext: ContextWithChain): void {
    // forward iteration: from A to Z
    for (let i = currentContext.__divergedChainIndex; i < currentContext.chain.length; i++) {
      if (!this.__isLatestRender(currentContext)) {
        break;
      }
      const currentComponent = currentContext.chain[i].element || {};
      const location = createLocation(currentContext, currentContext.chain[i].route);
      runCallbackIfPossible(
        (currentComponent as Partial<AfterEnterObserver>).onAfterEnter,
        [location, {} as EmptyCommands, this],
        currentComponent,
      );
    }
  }

  async __animateIfNeeded(context: ContextWithChain): Promise<ContextWithChain> {
    const from = (this.__disappearingContent || [])[0];
    const to = (this.__appearingContent || [])[0];
    const promises = [];

    const chain = context.chain;
    let config;
    for (let i = chain.length; i > 0; i--) {
      if (chain[i - 1].route.animate) {
        config = chain[i - 1].route.animate;
        break;
      }
    }

    if (from && to && config) {
      const leave = (isObject(config) && config.leave) || 'leaving';
      const enter = (isObject(config) && config.enter) || 'entering';
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

  __onNavigationEvent(event?: Event): void {
    const { pathname, search, hash } = event instanceof CustomEvent ? (event.detail as LocationInfo) : window.location;

    if (isString(this.__normalizePathname(pathname))) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      this.ready = this.render({ pathname, search, hash }, true);
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
   * @param triggers navigation triggers
   */
  static setTriggers(...triggers: NavigationTrigger[]) {
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
   * @function urlForName
   * @param name the route name or the route’s `component` name.
   * @param {Params=} params Optional object with route path parameters.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   *
   * @return {string}
   */
  urlForName(name: string, params?: Params | null) {
    if (!this.__urlForName) {
      this.__urlForName = generateUrls(this);
    }
    return getPathnameForRouter(this.__urlForName(name, params || undefined), this);
  }

  /**
   * Generates a URL for the given route path, optionally performing
   * substitution of parameters.
   *
   * @param path string route path declared in [express.js syntax](https://expressjs.com/en/guide/routing.html#route-paths").
   * @param params Optional object with route path parameters.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   *
   * @return
   */
  urlForPath(path: string, params?: Params | null): string {
    return getPathnameForRouter(compile(path)(params || undefined), this);
  }

  /**
   * Triggers navigation to a new path. Returns a boolean without waiting until
   * the navigation is complete. Returns `true` if at least one `Router`
   * has handled the navigation (was subscribed and had `baseUrl` matching
   * the `path` argument), otherwise returns `false`.
   *
   * @param path
   *   a new in-app path string, or an URL-like object with `pathname`
   *   string property, and optional `search` and `hash` string properties.
   * @return
   */
  static go(path: string | LocationInfo): boolean {
    const { pathname, search, hash } = isString(path)
      ? this.__createUrl(path, 'http://a') // some base to omit origin
      : path;
    return fireRouterEvent('go', { pathname, search, hash });
  }

  static __removeDomNodes(nodes?: ReadonlyArray<Element> | HTMLCollection | null): void {
    if (nodes && nodes.length) {
      const parent = nodes[0].parentNode;
      const childrenCount = nodes.length - 1;

      for (let i = childrenCount; i >= 0; i--) {
        parent && parent.removeChild(nodes[i]);
      }
    }
  }

  /**
   * @deprecated use `NavigationTrigger` instead of `Router.NavigationTrigger`.
   */
  static get NavigationTrigger() {
    return NavigationTrigger;
  }
}

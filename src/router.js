import Resolver from './resolver/resolver.js';
import {default as processAction} from './resolver/resolveRoute.js';
import setNavigationTriggers from './triggers/setNavigationTriggers.js';
import {log, loadBundle} from './utils.js';

function isResultNotEmpty(result) {
  return result !== null && result !== undefined;
}

function redirect(context, path) {
  const params = Object.assign({}, context.params);
  return {redirect: {pathname: path, from: getInvocationPath(context), params}};
}

function getInvocationPath(context) {
  if (!context.invocationPath) {
    return context.pathname;
  }

  let currentPath = context.invocationPath;
  let invocationPathName = '';
  while (currentPath) {
    invocationPathName = currentPath.path + invocationPathName;
    currentPath = currentPath.parent;
  }
  return invocationPathName;
}

function renderComponent(context, component) {
  const element = document.createElement(component);
  const params = Object.assign({}, context.params);
  element.route = {params, pathname: context.pathname};
  if (context.from) {
    element.route.redirectFrom = context.from;
  }
  return element;
}

function runCallbackIfPossible(callback, context, invocationPath) {
  if (typeof callback === 'function') {
    return callback(Object.assign({}, context, {invocationPath}));
  }
}

/**
 * A simple client-side router for single-page applications. It uses
 * express-style middleware and has a first-class support for Web Components and
 * lazy-loading. Works great in Polymer and non-Polymer apps.
 *
 * Use `new Router(outlet)` to create a new Router instance. The `outlet` parameter is a reference to the DOM node
 * to render the content into. The Router instance is automatically subscribed to navigation events on `window`.
 *
 * See [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html) for the detailed usage demo and code snippets.
 *
 * See also detailed API docs for the following methods, for the advanced usage:
 *
 * * [setOutlet](#/classes/Vaadin.Router#method-setOutlet) – should be used to configure the outlet.
 * * [setTriggers](#/classes/Vaadin.Router#method-setTriggers) – should be used to configure the navigation events.
 * * [setRoutes](#/classes/Vaadin.Router#method-setRoutes) – should be used to configure the routes.
 *
 * Only `setRoutes` has to be called manually, others are automatically invoked when creating a new instance.
 *
 * @memberof Vaadin
 * @extends Vaadin.Resolver
 * @demo demo/index.html
 * @summary JavaScript class that renders different DOM content depending on
 *    a given path. It can re-render when triggered or automatically on
 *    'popstate' and / or 'click' events.
 */
export class Router extends Resolver {

  /**
   * Creates a new Router instance with a given outlet, and
   * automatically subscribes it to navigation events on the `window`.
   * Using a constructor argument or a setter for outlet is equivalent:
   *
   * ```
   * const router = new Vaadin.Router();
   * router.setOutlet(outlet);
   * ```
   * @param {?Node} outlet
   * @param {?RouterOptions} options
   */
  constructor(outlet, options) {
    super([], Object.assign({}, options));
    this.resolveRoute = context => this.__resolveRoute(context);

    const triggers = Router.NavigationTrigger;
    Router.setTriggers.apply(Router, Object.keys(triggers).map(key => triggers[key]));

    /**
     * A promise that is settled after the current render cycle completes. If
     * there is no render cycle in progress the promise is immediately settled
     * with the last render cycle result.
     *
     * @public
     * @type {!Promise<?Node>}
     */
    this.ready;
    this.ready = Promise.resolve(outlet);

    this.__lastStartedRenderId = 0;
    this.__navigationEventHandler = this.__onNavigationEvent.bind(this);
    this.__activeRoutes = [];
    this.setOutlet(outlet);
    this.subscribe();
  }

  __resolveRoute(context) {
    const route = context.route;
    context.redirect = function(path) {
      return redirect(this, path);
    };
    context.component = function(component) {
      return renderComponent(this, component);
    };

    const actionResult = runCallbackIfPossible(processAction, context, route);
    if (isResultNotEmpty(actionResult)) {
      return actionResult;
    }

    if (typeof route.redirect === 'string') {
      return context.redirect(route.redirect);
    }

    if (route.path) {
      const newActiveRouteIndex = (context.__resolutionChain || (context.__resolutionChain = [])).push(context.route) - 1;
      if (this.__activeRoutes && this.__activeRoutes.length > newActiveRouteIndex) {
        const oldActiveRoute = this.__activeRoutes[newActiveRouteIndex];
        if (oldActiveRoute.path !== context.__resolutionChain[newActiveRouteIndex].path) {
          const inactivationResult = this.__runInactivationChain(newActiveRouteIndex, context);
          if (isResultNotEmpty(inactivationResult)) {
            return inactivationResult;
          }
        }
      }
    }

    if (route.bundle) {
      return loadBundle(route.bundle)
        .then(() => this.__processComponent(route, context))
        .catch(e => new Error(log(`Bundle not found: ${route.bundle}. Check if the file name is correct`)));
    }

    return this.__processComponent(route, context);
  }

  __processComponent(route, context) {
    if (typeof route.component === 'string') {
      const newActiveRoutesLength = (context.__resolutionChain || []).length;
      if (newActiveRoutesLength < this.__activeRoutes.length) {
        const inactivationResult = this.__runInactivationChain(newActiveRoutesLength - 1, context);
        if (isResultNotEmpty(inactivationResult)) {
          return inactivationResult;
        }
      }
      return context.component(route.component);
    }
  }

  __runInactivationChain(divergedRouteIndex, context) {
    for (let i = this.__activeRoutes.length - 1; i >= divergedRouteIndex; i--) {
      const routeToInactivate = this.__activeRoutes[i];
      const inactivationResult = runCallbackIfPossible(routeToInactivate.inactivate, context, routeToInactivate);
      if (inactivationResult === false) {
        context.__resolutionChain = this.__activeRoutes;
        return this.__previousResolution;
      }
    }
    this.__activeRoutes = [];
  }

  /**
   * Sets the router outlet (the DOM node where the content for the current
   * route is inserted). Any content pre-existing in the router outlet is
   * removed at the end of each render pass.
   *
   * NOTE: this method is automatically invoked first time when creating a new Router instance.
   *
   * @param {?Node} outlet the DOM node where the content for the current route
   *     is inserted.
   */
  setOutlet(outlet) {
    if (outlet) {
      this.__ensureOutlet(outlet);
    }
    this.__outlet = outlet;
  }

  /**
   * Returns the current router outlet. The initial value is `undefined`.
   *
   * @return {?Node} the current router outlet (or `undefined`)
   */
  getOutlet() {
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
   * * `action` – the action that is executed before the route is resolved.
   * The value for this property should be a function, accepting a `context` parameter.
   * If present, this function is always invoked first, disregarding of the other properties' presence.
   * If the action returns a non-empty result, current route resolution is finished and other route config properties are ignored.
   * `context` parameter can be used for asynchronously getting the resolved route contents via `context.next()`
   * and for getting route parameters via `context.params`.
   * Also, 'context' contains 'invocationPath' property that holds the info on the route that caused the function to be triggered.
   * For 'action' this is the same route, but for other functions it may differ.
   * See also **Route Actions** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
   *
   * * `redirect` – other route's path to redirect to. Passes all route parameters to the redirect target.
   * The target route should also be defined.
   * See also **Redirects** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
   *
   * * `bundle` – `.js` or `.mjs` bundle to load before resolving the route. Each bundle is only loaded once.
   * The property is ignored when either an `action` returns the result or `redirect` property is present.
   * Any error, e.g. 404 while loading bundle will cause route resolution to throw.
   * See also **Lazy Loading** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
   *
   * * `component` – the tag name of the Web Component to resolve the route to.
   *The property is ignored when either an `action` returns the result or `redirect` property is present.
   *
   * * `children` – nested routes. Parent routes' properties are executed before resolving the children.
   * Children 'path' values are relative to the parent ones.
   *
   * * `inactivate` – after each resolution, router marks each route used in the resolution as an active route:
   * if a hierarchy of '/a', '/b' (child of '/a'), '/c' (child of '/b') routes was defined, and user visits '/a/b/c' path,
   * router will track ['/a', '/b', '/c'] routes as active ones, remembering their order also.
   * During the next resolution, router compares new routes used in the resolution and,
   * at the moment when they start to differ from the active ones, router calls 'inactivate' method on each route that is different:
   * if, for previous example, user visits '/a/d' path and it's a valid path, routes '/c' and '/b' will be inactivated.
   * Inactivation always happens from the last active element to the first that is different from the new route,
   * if the method is not defined for any route, the route is skipped.
   * Each `inactivate` call gets a `context` parameter, described above.
   * If `inactivate` method returns `false`, inactivation and new path resolution is cancelled,
   * router restores the state before new resolution.
   * Otherwise router updates the active routes and waits for the next resolution to happen.
   *
   * NOTE: `inactivate` is considered to be an internal router feature, for the examples, refer to the router tests.
   *
   * @param {!Array<!Object>|!Object} routes a single route or an array of those
   */
  setRoutes(routes) {
    super.setRoutes(routes);
    this.__onNavigationEvent();
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
   * @param {!string|!{pathname: !string}} pathnameOrContext the pathname to
   *    render or a context object with a `pathname` property and other
   *    properties to pass to the resolver.
   * @return {!Promise<!Node>}
   */
  render(pathnameOrContext, shouldUpdateHistory) {
    this.__ensureOutlet();
    const renderId = ++this.__lastStartedRenderId;
    this.ready = this.resolve(pathnameOrContext)
      .then(context => {
        const result = context.result;
        if (result instanceof HTMLElement) {
          return context;
        } else if (result.redirect) {
          const redirect = result.redirect;
          return this.resolve({
            pathname: Router.pathToRegexp.compile(redirect.pathname)(redirect.params),
            from: redirect.from
          });
        } else if (result instanceof Error) {
          return Promise.reject(result);
        } else {
          return Promise.reject(
            new Error(
              log(
                `Invalid route resolution result for path "${pathnameOrContext}". ` +
                `Expected redirect object or HTML element, but got: "${result}". ` +
                `Double check the action return value for the route.`
              )
            ));
        }
      })
      .then(context => {
        if (renderId === this.__lastStartedRenderId) {
          if (shouldUpdateHistory) {
            this.__updateBrowserHistory(context.result.route.pathname);
          }
          this.__setOutletContent(context.result);
          this.__activeRoutes = context.__resolutionChain || [];
          this.__previousResolution = context.result;
          return this.__outlet;
        }
      })
      .catch(error => {
        if (renderId === this.__lastStartedRenderId) {
          if (shouldUpdateHistory) {
            this.__updateBrowserHistory(pathnameOrContext);
          }
          this.__setOutletContent();
          throw error;
        }
      });
    return this.ready;
  }

  __ensureOutlet(outlet = this.__outlet) {
    if (!(outlet instanceof Node)) {
      throw new TypeError(log(`Expected router outlet to be a valid DOM Node (but got ${outlet})`));
    }
  }

  __updateBrowserHistory(pathnameOrContext) {
    const pathname = pathnameOrContext.pathname || pathnameOrContext;
    if (window.location.pathname !== pathname) {
      window.history.pushState(null, document.title, pathname);
      window.dispatchEvent(new PopStateEvent('popstate', {state: 'vaadin-router:ignore'}));
    }
  }

  __setOutletContent(element) {
    this.__ensureOutlet();
    const children = this.__outlet.children;
    if (children && children.length) {
      const parent = children[0].parentNode;
      for (let i = 0; i < children.length; i += 1) {
        parent.removeChild(children[i]);
      }
    }
    if (element) {
      this.__outlet.appendChild(element);
    }
  }

  /**
   * Subscribes this instance to navigation events on the `window`.
   *
   * NOTE: beware of resource leaks. For as long as a router instance is
   * subscribed to navigation events, it won't be garbage collected.
   */
  subscribe() {
    window.addEventListener('vaadin-router:navigate',
      this.__navigationEventHandler);
  }

  /**
   * Removes the subscription to navigation events created in the `subscribe()`
   * method.
   */
  unsubscribe() {
    window.removeEventListener('vaadin-router:navigate',
      this.__navigationEventHandler);
  }

  __onNavigationEvent(event) {
    const pathname = event ? event.detail.pathname : window.location.pathname;
    if (this.root.children.length > 0) {
      this.render(pathname, true);
    }
  }

  /**
   * Configures what triggers Vaadin.Router navigation events:
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
   * See also **Navigation Triggers** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
   *
   * @param {...NavigationTrigger} triggers
   */
  static setTriggers(...triggers) {
    setNavigationTriggers(triggers);
  }
}

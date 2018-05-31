import Resolver from './resolver/resolver.js';
import {default as processAction} from './resolver/resolveRoute.js';
import setNavigationTriggers from './triggers/setNavigationTriggers.js';
import {loadBundle} from './utils.js';

function isResultNotEmpty(result) {
  return result !== null && result !== undefined;
}

/**
 * A simple client-side router for single-page applications. It uses
 * express-style middleware and has a first-class support for Web Components and
 * lazy-loading. Works great in Polymer and non-Polymer apps.
 *
 * ### Basic example
 * ```
 * import {Router} from '@vaadin/router';
 *
 * const router = new Router(document.getElementById('outlet'));
 * router.setRoutes([
 *   {path: '/', component: 'x-home-view'},
 *   {path: '/users', component: 'x-user-list'}
 * ]);
 * ```
 *
 * ### Lazy-loading example
 * A bit more involved example with lazy-loading:
 * ```
 * import {Router} from '@vaadin/router';
 *
 * const routes = [
 *   {path: '/', component: 'x-home-view'},
 *   {
 *     path: '/users',
 *     bundle: 'bundles/user-bundle.html',
 *     children: [
 *       {path: '/', component: 'x-user-list'},
 *       {path: '/:user', component: 'x-user-profile'}
 *     ]
 *   }
 * ];
 *
 * const router = new Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 *
 * ### Middleware example
 * A more complex example with custom route handlers and server-side rendered
 * content:
 * ```
 * import {Router} from '@vaadin/router';
 *
 * const routes = [
 *   {
 *     path: '/',
 *     action: async (context) => {
 *       // record the navigation completed event for analytics
 *       analytics.recordNavigationStart(context.path);
 *
 *       // let the navigation happen and wait for the result
 *       const result = await context.next();
 *
 *       // record the navigation completed event for analytics
 *       analytics.recordNavigationEnd(context.path, result.status);
 *
 *       // pass the result up the handlers chain
 *       return result;
 *     }
 *   },
 *   {
 *     path: '/',
 *     component: 'x-home-view'
 *   },
 *   {
 *     path: '/users',
 *     bundle: 'bundles/user-bundle.html',
 *     children: [
 *       {path: '/', component: 'x-user-list'},
 *       {path: '/:user', component: 'x-user-profile'}
 *     ]
 *   },
 *   {
 *     path: '/server',
 *     action: async (context) => {
 *       // fetch the server-side rendered content
 *       const result = await fetch(context.path, {...});
 *
 *       // modify the content if necessary
 *       result.body = result.body.replace(/bad/ig, 'good');
 *
 *       // create DOM objects out of the server-side result (string)
 *       return renderToDom(result);
 *     }
 *   }
 * ];
 *
 * const router = new Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 *
 * For more detailed information on the route object properties, refer to 'setRoutes' method description.
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
   *
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

    const actionResult = processAction(context);
    if (isResultNotEmpty(actionResult)) {
      return actionResult;
    }

    if (typeof route.redirect === 'string') {
      const params = Object.assign({}, context.params);
      return {redirect: {pathname: route.redirect, from: context.pathname, params}};
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
      return loadBundle(route.bundle).then(() => this.__processComponent(route, context));
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
      return Router.renderComponent(route.component, context);
    }
  }

  __runInactivationChain(divergedRouteIndex, context) {
    for (let i = this.__activeRoutes.length - 1; i >= divergedRouteIndex; i--) {
      const routeToInactivate = this.__activeRoutes[i];
      if (typeof routeToInactivate.inactivate === 'function') {
        context.inactivatedRoute = routeToInactivate;
        const inactivationResult = routeToInactivate.inactivate(context);
        if (inactivationResult === false) {
          context.__resolutionChain = this.__activeRoutes;
          return this.__previousResolution;
        }
      }
    }
    this.__activeRoutes = [];
  }

  /**
   * Sets the router outlet (the DOM node where the content for the current
   * route is inserted). Any content pre-existing in the router outlet is
   * removed at the end of each render pass.
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
   * * {!string} path – the route path (relative to the parent route if any) in the
   * <a href="https://expressjs.com/en/guide/routing.html#route-paths" target="_blank">express.js syntax</a>.
   *
   * * {?function(context)} action – the action that is executed before the route is resolved.
   * If present, action property is always processed first, disregarding of the other properties' presence.
   * If action returns a value, current route resolution is finished (i.e. other route properties are not processed).
   * 'context' parameter can be used for asynchronously getting the resolved route contents via 'context.next()'
   * and for getting route parameters via 'context.params'.
   *
   * * {?string} redirect – other route's path to redirect to. Passes all route parameters to the redirect target.
   * The target route should also be defined.
   *
   * * {?string} bundle – '*.js' or '*.mjs' bundles to load before resolving the route. Each bundle is loaded only once.
   * Is not triggered when either an 'action' returns the result or 'redirect' property is present.
   *
   * * {?string} component – the tag name of the Web Component to resolve the route to.
   * Is not considered when either an 'action' returns the result or 'redirect' property is present.
   *
   * * {?Array<Object>} children – nested routes. Parent routes' properties are executed before resolving the children.
   * Children 'path' values are relative to the parent ones.
   *
   * * {?function(context)} inactivate – after each resolution, router marks each route used in the resolution as an active route:
   * if a hierarchy of '/a', '/b' (child of '/a'), '/c' (child of '/b') routes was defined, and user visits '/a/b/c' path,
   * router will track ['/a', '/b', '/c'] routes as active ones, remembering their order also.
   * During the next resolution, router compares new routes used in the resolution and,
   * at the moment when they start to differ from the active ones, router calls 'inactivate' method on each route that is different:
   * if, for previous example, user visits '/a/d' path and it's a valid path, routes '/c' and '/b' will be inactivated.
   * Inactivation always happens from the last active element to the first that is different from the new route,
   * if the method is not defined for any route, the route is skipped.
   * Each `inactivate` call gets a `context` parameter, described above.
   * In this case, context parameter contains an additional `inactivatedRoute` property,
   * that holds an information on the currently inactivated route.
   * If `inactivate` method returns `false`, inactivation and new path resolution is cancelled,
   * router restores the state before new resolution.
   * Otherwise router updates the active routes and waits for the next resolution to happen.
   *
   * Note: `inactivate` is considered to be an internal router feature, for the examples, refer to the router tests.
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
        if (context.result instanceof HTMLElement) {
          return context;
        } else if (context.result.redirect) {
          const redirect = context.result.redirect;
          return this.resolve({
            pathname: Router.pathToRegexp.compile(redirect.pathname)(redirect.params),
            from: redirect.from
          });
        } else {
          return Promise.reject(new Error(`Incorrect route resolution result for path '${pathnameOrContext}'. ` +
            `Expected redirect object or HTML element, but got: '${context.result}'.` +
            `Double check the action return value for the route.`));
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
      throw new TypeError(`expected router outlet to be a valid DOM Node (but got ${outlet})`);
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
   * Creates and returns an instance of a given custom element.
   *
   * @param {!string} component tag name of a web component to render
   * @param {?context} context an optional context object
   * @return {!HTMLElement}
   * @protected
   */
  static renderComponent(component, context) {
    const element = document.createElement(component);
    const params = Object.assign({}, context.params);
    element.route = {params, pathname: context.pathname};
    if (context.from) {
      element.route.redirectFrom = context.from;
    }
    return element;
  }

  /**
   * Configures what triggers Vaadin.Router navigation events:
   *  - `POPSTATE`: popstate events on the current `window`
   *  - `CLICK`: click events on `<a>` links leading to the current page
   *
   * By default, both `POPSTATE` and `CLICK` are enabled.
   * Below is an example of how to only use one of them:
   *
   * ```
   * import {Router} from '@vaadin/router';
   * import CLICK from '@vaadin/router/triggers/click';
   *
   * Router.setTriggers(POPSTATE);
   * // or, if you only need click:
   * // Router.setTriggers(CLICK);
   * ```
   *
   * The `POPSTATE` and `CLICK` navigation triggers need to be imported
   * separately to enable efficient tree shaking: if the app does not use `<a>`
   * clicks as navigation triggers, you should be able to exclude the code
   * needed to handle them from the bundle.
   *
   * See the `router-config.js` for the default navigation triggers config.
   * Based on this file, you can create the own one and import it instead.
   *
   * @param {...NavigationTrigger} triggers
   */
  static setTriggers(...triggers) {
    setNavigationTriggers(triggers);
  }
}

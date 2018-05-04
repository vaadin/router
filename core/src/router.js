import Resolver from './resolver/resolver.js';

function resolveRoute(context, params) {
  const route = context.route;
  // TODO(vlukashov): export this from UniversalRouter
  if (typeof route.action === 'function') {
    return route.action(context, params);
  } else if (typeof route.component === 'string') {
    return Router.renderComponent(route.component, context);
  }
}

/**
 * @typedef Route
 * @type {object}
 * @property {!string} path
 * @property {?string} component
 * @property {?string} importUrl
 * @property {?function(context, next)} action
 * @property {?Array<Route>} children
 */

/**
 * A simple client-side router for single-page applications. It uses
 * express-style middleware and has a first-class support for Web Components and
 * lazy-loading. Works great in Polymer and non-Polymer apps.
 * 
 * ### Basic example
 * ```
 * const routes = [
 *   { path: '/', component: 'x-home-view' },
 *   { path: '/users', component: 'x-user-list' }
 * ];
 * 
 * const router = new Vaadin.Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 * 
 * ### Lazy-loading example
 * A bit more involved example with lazy-loading:
 * ```
 * const routes = [
 *   { path: '/', component: 'x-home-view' },
 *   { path: '/users',
 *     bundle: 'bundles/user-bundle.html',
 *     children: [
 *       { path: '/', component: 'x-user-list' },
 *       { path: '/:user', component: 'x-user-profile' }
 *     ]
 *   }
 * ];
 * 
 * const router = new Vaadin.Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 * 
 * ### Middleware example
 * A more complex example with custom route handers and server-side rendered
 * content:
 * ```
 * const routes = [
 *   { path: '/',
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
 *   { path: '/', component: 'x-home-view' },
 *   { path: '/users',
 *     bundle: 'bundles/user-bundle.html',
 *     children: [
 *       { path: '/', component: 'x-user-list' },
 *       { path: '/:user', component: 'x-user-profile' }
 *     ]
 *   },
 *   { path: '/server',
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
 * const router = new Vaadin.Router(document.getElementById('outlet'));
 * router.setRoutes(routes);
 * ```
 * 
 * @memberof Vaadin
 * @demo demo/?core
 * @summary JavaScript class that renders different DOM content depending on
 *    a given path. It can re-render when triggered or on the 'popstate' event.
 */
export class Router extends Resolver {
  
  /**
   * Creates a new Router instance with a given outlet.
   * Equivalent to
   * ```
   * const router = new Vaadin.Router();
   * router.setOutlet(outlet);
   * router.setOptions(options);
   * ```
   *
   * @param {?Node} outlet
   * @param {?RouterOptions} options
   */
  constructor(outlet, options) {
    super([], Object.assign({resolveRoute}, options));
    this.setOutlet(outlet);
    this.__renderCount = 0;
    this.__popstateHandler = this.__onNavigationEvent.bind(this);
    this.subscribe();
  }

  setOutlet(outlet) {
    if (outlet && !(outlet instanceof Node)) {
      throw new TypeError(`expected router outlet to be a valid DOM Node (but got ${outlet})`);
    }
    this.__outlet = outlet;
  }

  getOutlet() {
    return this.__outlet;
  }

  setRoutes(routes) {
    super.setRoutes(routes);
    this.__onNavigationEvent();
  }

  /**
   * Resolves the given path and renders the route DOM into the router outlet if
   * it is set. If no router outlet is set at the time of calling this method,
   * it throws an Error.
   * 
   * Returns a promise that is fullfilled after the route DOM is inserted into
   * the router outlet, or rejected if no route matches the given path.
   * 
   * @param {!string} path the path to render
   * @param {?object} context an optional context to pass to route handlers
   * @return {Promise<Node>}
   */
  render(path, context) {
    // TODO(vlukashov): handle the 'no outlet' case
    const renderId = ++this.__renderCount;
    return this.resolve(path, context)
      .then(element => {
        // TODO(vlukashov): handle the 'no outlet' case
        if (this.__outlet && this.__renderCount === renderId) {
          this.__clearOutlet();
          this.__outlet.appendChild(element);
          return this.__outlet;
        }
      })
      .catch(error => {
        if (this.__outlet && this.__renderCount === renderId) {
          this.__clearOutlet();
          throw error;
        }
      });
  }

  __clearOutlet() {
    const children = this.__outlet.children;
    if (children && children.length) {
      const parent = children[0].parentNode;
      for (let i = 0; i < children.length; i += 1) {
        parent.removeChild(children[i]);
      }
    }
  }

  subscribe() {
    window.addEventListener('popstate', this.__popstateHandler);
  }

  unsubscribe() {
    window.removeEventListener('popstate', this.__popstateHandler);
  }

  __onNavigationEvent() {
    if (this.root.children.length > 0) {
      this.render(window.location.pathname);
    }
  }

  /**
   * Creates and returns an instance of a given custom element.
   * 
   * @param {!string} component tag name of a web component to render
   * @param {?context} context an optional context object
   * @return {!HTMLElement}
   */
  static renderComponent(component, context) {
    const element = document.createElement(component);
    for (const param of Object.keys(context.params)) {
      element[param] = context.params[param];
    }
    return element;
  }
}


import Resolver from './resolver/resolver.js';
import {default as processAction} from './resolver/resolveRoute.js';
import setNavigationTriggers from './triggers/setNavigationTriggers.js';
import animate from './transitions/animate.js';
import {ensureRoute, fireRouterEvent, loadBundle, log, toArray} from './utils.js';

function isResultNotEmpty(result) {
  return result !== null && result !== undefined;
}

function redirect(context, pathname) {
  const params = Object.assign({}, context.params);
  return {
    redirect: {
      pathname,
      from: context.pathname,
      params
    }
  };
}

function renderComponent(context, component) {
  const element = context.route.__component || document.createElement(component);
  const params = Object.assign({}, context.params);
  element.route = {params, pathname: context.pathname};
  if (context.from) {
    element.route.redirectFrom = context.from;
  }
  context.route.__component = element;
  return element;
}

function runCallbackIfPossible(callback, context, thisObject) {
  if (typeof callback === 'function') {
    return callback.call(thisObject, context);
  }
}

function amend(amendmentFunction, context, route) {
  return amendmentResult => {
    if (amendmentResult && (amendmentResult.cancel || amendmentResult.redirect)) {
      return amendmentResult;
    }

    const component = route.__component;
    if (component) {
      return runCallbackIfPossible(component[amendmentFunction],
        Object.assign({cancel: () => ({cancel: true})}, context, {next: undefined}), component);
    }
  };
}

function processNewChildren(newChildren, route, context) {
  if (typeof newChildren !== 'object') {
    throw new Error(log(`Expected 'children' method  of the route with path '${route.path}' `
      + `to return an object, but got: '${newChildren}'`));
  }

  route.children = [];
  const childRoutes = toArray(newChildren);
  for (let i = 0; i < childRoutes.length; i++) {
    ensureRoute(childRoutes[i]);
    route.children.push(childRoutes[i]);
  }

  if (route.component) {
    return processComponent(route, context);
  }
}

function processComponent(route, context) {
  if (typeof route.component === 'string') {
    return renderComponent(context, route.component);
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
    this.setOutlet(outlet);
    this.subscribe();
  }

  __resolveRoute(context) {
    const route = context.route;

    const updatedContext = Object.assign({
      redirect: path => redirect(context, path),
      component: component => renderComponent(context, component)
    }, context);
    const actionResult = runCallbackIfPossible(processAction, updatedContext, route);
    if (isResultNotEmpty(actionResult)) {
      return actionResult;
    }

    if (typeof route.redirect === 'string') {
      return redirect(context, route.redirect);
    }

    let callbacks = Promise.resolve();

    if (route.bundle) {
      callbacks = callbacks.then(() => loadBundle(route.bundle))
        .catch(() => {
          throw new Error(log(`Bundle not found: ${route.bundle}. Check if the file name is correct`));
        });
    }

    return callbacks.then(() => runCallbackIfPossible(route.children, Object.assign({}, context, {next: undefined}), route))
      .then(newChildren => {
        if (typeof route.children === 'function') {
          delete route.children;
        }
        return isResultNotEmpty(newChildren)
          ? processNewChildren(newChildren, route, context)
          : processComponent(route, context);
      });
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
   * The value for this property should be a function, accepting a `context` parameter described below.
   * If present, this function is always invoked first, disregarding of the other properties' presence.
   * If the action returns a non-empty result, current route resolution is finished and other route config properties are ignored.
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
   * * `children` – array of nested routes or a function that provides the array.
   * Function can accept a `context` parameter described below and either be asynchronous or synchronous: in the former case,
   * the path resolution will be paused until the function returns the result.
   * Function is executed only once: it's return value is cached and used for further resolutions.
   * Parent routes' properties are executed before resolving the children. Children 'path' values are relative to the parent ones.
   *
   * * `component` – the tag name of the Web Component to resolve the route to.
   * The property is ignored when either an `action` returns the result or `redirect` property is present.
   * If route contains the `component` property (or an action that return a component)
   * and its child route also contains the `component` property, child route's component
   * will be rendered as a light dom child of a parent component.
   *
   * `context` object that is passed to `route` functions holds the following properties:
   * * `context.pathname` – string with the pathname being resolved
   *
   * * `context.params` – object with route parameters
   *
   * * `context.route` – object that holds the route that is currently being rendered.
   *
   * In addition to those properties, `action` function has additional helper methods:
   *
   * * `context.next()` – function for asynchronously getting the next route contents from the resolution chain (if any)
   *
   * * `context.redirect(path)` – function that creates a redirect data for the path specified.
   *
   * * `context.component(component)` – function that creates a new HTMLElement with current context
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
    const renderId = ++this.__lastStartedRenderId;
    this.ready = this.resolve(pathnameOrContext)
      .then(originalContext => this.__fullyResolveChain(originalContext, originalContext))
      .then(context => {
        if (renderId === this.__lastStartedRenderId) {
          if (shouldUpdateHistory) {
            this.__updateBrowserHistory(context.result.route.pathname, context.from);
          }

          if (context !== this.__previousContext) {
            return this.__runOnAfterCallbacks(context, this.__previousContext, 'onAfterLeave')
              .then(() => this.__setOutletContent(context))
              .then(() => this.__runOnAfterCallbacks(context, context, 'onAfterEnter'))
              .then(() => context);
          }
          return Promise.resolve(context);
        }
      })
      .then(context => {
        if (renderId === this.__lastStartedRenderId) {
          return this.__animateIfNeeded(context);
        }
      })
      .then(context => {
        if (renderId === this.__lastStartedRenderId) {
          this.__removeOldOutletContent();
        }
        this.__previousContext = context;
        fireRouterEvent('route-changed', {pathname: context.pathname});
        return this.__outlet;
      })
      .catch(error => {
        if (renderId === this.__lastStartedRenderId) {
          if (shouldUpdateHistory) {
            this.__updateBrowserHistory(pathnameOrContext);
          }
          this.__removeOutletContent();
          fireRouterEvent('error', {error});
          throw error;
        }
      });
    return this.ready;
  }

  __fullyResolveChain(originalContext, currentContext) {
    return this.__amendWithResolutionResult(currentContext)
      .then(amendedContext => {
        const initialContext = amendedContext !== currentContext ? amendedContext : originalContext;
        return amendedContext.next()
          .then(nextContext => {
            return nextContext
              ? this.__fullyResolveChain(initialContext, nextContext)
              : this.__amendWithLifecycleCallbacks(initialContext);
          });
      });
  }

  __amendWithResolutionResult(context) {
    const result = context.result;
    if (result instanceof HTMLElement) {
      return Promise.resolve(context);
    } else if (result.redirect) {
      return this.__redirect(result.redirect);
    } else if (result instanceof Error) {
      return Promise.reject(result);
    } else {
      return Promise.reject(
        new Error(
          log(
            `Invalid route resolution result for path "${context.pathname}". ` +
            `Expected redirect object or HTML element, but got: "${result}". ` +
            `Double check the action return value for the route.`
          )
        ));
    }
  }

  __amendWithLifecycleCallbacks(contextWithFullChain) {
    return this.__runLifecycleCallbacks(contextWithFullChain).then(amendedContext => {
      if (amendedContext === this.__previousContext || amendedContext === contextWithFullChain) {
        return amendedContext;
      }
      return this.__fullyResolveChain(amendedContext, amendedContext);
    });
  }

  __runLifecycleCallbacks(newContext) {
    const previousChain = (this.__previousContext || {}).chain;
    const newChain = newContext.chain;

    let callbacks = Promise.resolve();

    newContext.__divergedChainIndex = 0;
    if (previousChain && previousChain.length) {
      for (; newContext.__divergedChainIndex < Math.min(previousChain.length, newChain.length); newContext.__divergedChainIndex++) {
        if (previousChain[newContext.__divergedChainIndex] !== newChain[newContext.__divergedChainIndex]) {
          break;
        }
      }

      for (let i = previousChain.length - 1; i >= newContext.__divergedChainIndex; i--) {
        callbacks = callbacks
          .then(amend('onBeforeLeave', newContext, previousChain[i]))
          .then(result => {
            if (!(result || {}).redirect) {
              return result;
            }
          });
      }
    }

    const onBeforeEnterContext = Object.assign({redirect: path => redirect(newContext, path)}, newContext);
    for (let i = newContext.__divergedChainIndex; i < newChain.length; i++) {
      callbacks = callbacks.then(amend('onBeforeEnter', onBeforeEnterContext, newChain[i]));
    }

    return callbacks.then(amendmentResult => {
      if (amendmentResult) {
        if (amendmentResult.cancel) {
          return this.__previousContext;
        }
        if (amendmentResult.redirect) {
          return this.__redirect(amendmentResult.redirect);
        }
      }
      return newContext;
    });
  }

  __redirect(redirectData) {
    return this.resolve({
      pathname: Router.pathToRegexp.compile(redirectData.pathname)(redirectData.params),
      from: redirectData.from
    });
  }

  __ensureOutlet(outlet = this.__outlet) {
    if (!(outlet instanceof Node)) {
      throw new TypeError(log(`Expected router outlet to be a valid DOM Node (but got ${outlet})`));
    }
  }

  __updateBrowserHistory(pathnameOrContext, replace) {
    const pathname = pathnameOrContext.pathname || pathnameOrContext;
    if (window.location.pathname !== pathname) {
      const changeState = replace ? 'replaceState' : 'pushState';
      window.history[changeState](null, document.title, pathname);
      window.dispatchEvent(new PopStateEvent('popstate', {state: 'vaadin-router-ignore'}));
    }
  }

  __setOutletContent(context) {
    this.__removePendingContent();

    function containsElement(htmlElements, elementToSearch) {
      for (let i = 0; i < htmlElements.length; i++) {
        if (htmlElements[i] === elementToSearch) {
          return true;
        }
      }
      return false;
    }

    this.__ensureOutlet();

    let lastUnchangedComponent = this.__outlet;

    if (context) {
      for (let i = 0; i < context.__divergedChainIndex; i++) {
        const unchangedComponent = context.chain[i].__component;
        if (unchangedComponent) {
          if (containsElement(lastUnchangedComponent.children || [], unchangedComponent)) {
            lastUnchangedComponent = unchangedComponent;
          } else {
            break;
          }
        }
      }
    }

    this.__oldContent = Array.from(lastUnchangedComponent.childNodes);
    this.__newContent = [];

    if (context) {
      let parentElement = lastUnchangedComponent;
      for (let i = context.__divergedChainIndex; i < context.chain.length; i++) {
        const componentToAdd = context.chain[i].__component;
        if (componentToAdd) {
          parentElement.appendChild(componentToAdd);
          parentElement = componentToAdd;
          this.__newContent.push(componentToAdd);
        }
      }
    }
  }

  __removeOldOutletContent() {
    if (this.__oldContent && this.__oldContent.length) {
      this.__removeOutletContent(this.__oldContent);
    }
    this.__oldContent = null;
    this.__newContent = null;
  }

  __removePendingContent() {
    if (this.__oldContent && this.__newContent) {
      this.__oldContent = this.__newContent;
      this.__removeOldOutletContent();
    }
  }

  __removeOutletContent(content) {
    content = content || (this.__outlet && this.__outlet.children);
    if (content && content.length) {
      const parent = content[0].parentNode;
      for (let i = 0; i < content.length; i += 1) {
        parent.removeChild(content[i]);
      }
    }
  }

  __runOnAfterCallbacks(currentContext, targetContext, callbackName) {
    let promises = Promise.resolve();
    if (targetContext) {
      const callbackContext = Object.assign({}, currentContext, {next: undefined});

      for (let i = currentContext.__divergedChainIndex; i < targetContext.chain.length; i++) {
        const currentComponent = targetContext.chain[i].__component || {};
        promises = promises.then(() => runCallbackIfPossible(currentComponent[callbackName], callbackContext, currentComponent));
      }
    }
    return promises;
  }

  __animateIfNeeded(context) {
    const from = this.__oldContent && this.__oldContent[0];
    const to = this.__newContent && this.__newContent[0];
    const promises = [];

    const chain = context.chain;
    let config;
    for (let i = chain.length; i > 0; i--) {
      if (chain[i - 1].animate) {
        config = chain[i - 1].animate;
        break;
      }
    }

    if (from && to && config) {
      const isObj = typeof config === 'object';
      const leave = isObj && config.leave || 'leaving';
      const enter = isObj && config.enter || 'entering';
      promises.push(animate(from, leave));
      promises.push(animate(to, enter));
    }

    if (promises.length) {
      return new Promise(resolve => {
        Promise.all(promises).then(() => resolve(context));
      });
    }

    return context;
  }

  /**
   * Subscribes this instance to navigation events on the `window`.
   *
   * NOTE: beware of resource leaks. For as long as a router instance is
   * subscribed to navigation events, it won't be garbage collected.
   */
  subscribe() {
    window.addEventListener('vaadin-router-go', this.__navigationEventHandler);
  }

  /**
   * Removes the subscription to navigation events created in the `subscribe()`
   * method.
   */
  unsubscribe() {
    window.removeEventListener('vaadin-router-go', this.__navigationEventHandler);
  }

  __onNavigationEvent(event) {
    const pathname = event ? event.detail.pathname : window.location.pathname;
    this.render(pathname, true);
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

  /**
   * Triggers navigation to a new path and returns without waiting until the
   * navigation is complete.
   *
   * @param {!string} pathname a new in-app path
   */
  static go(pathname) {
    fireRouterEvent('go', {pathname});
  }
}

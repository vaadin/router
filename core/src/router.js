import UniversalRouter from 'universal-router';

import {toArray, ensureRoutes} from './utils.js';

function resolveRoute(context, params) {
  const route = context.route;
  // TODO: export this from UniversalRouter
  if (typeof route.action === 'function') {
    return route.action(context, params);
  } else if (typeof route.component === 'string') {
    return Router.renderComponent(route.component, context);
  }
}

const DEFAULT_OPTIONS = {
  baseUrl: '',
  resolveRoute: resolveRoute
};

/**
 * @memberof Vaadin
 */
export class Router {
  constructor(routes, options) {
    routes = routes || [];
    ensureRoutes(routes);

    this.__routes = routes;
    this.__options = Object.assign(DEFAULT_OPTIONS, options);
    this.__router = new UniversalRouter(this.__routes, this.__options);
  }

  getOptions() {
    return Object.assign({}, this.__options);
  }

  setOptions(someOptions) {
    if ('baseUrl' in someOptions) {
      this.__options.baseUrl = someOptions.baseUrl;
      this.__router.baseUrl = someOptions.baseUrl;
    }
  }

  getRoutes() {
    return [...this.__routes];
  }

  setRoutes(routes) {
    ensureRoutes(routes);
    this.__routes = [...toArray(routes)];
    this.__router.root.children = this.__routes;
  }

  addRoutes(routes) {
    ensureRoutes(routes);
    this.__routes.push(...toArray(routes));
  }

  removeRoutes(routes) {
    toArray(routes).forEach(route => {
      const index = this.__routes.indexOf(route);
      if (index > -1) {
        this.__routes.splice(index, 1);
      }
    });
  }

  render(path, contextOrNothing) {
    return this.__router.resolve(Object.assign({pathname: path}, contextOrNothing));
  }

  static renderComponent(component, context) {
    const element = document.createElement(component);
    for (const param of Object.keys(context.params)) {
      element[param] = context.params[param];
    }
    return element;
  }
}


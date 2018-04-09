import {toArray, ensureRoutes} from './utils.js';

/**
 * @memberof Vaadin
 */
export class Route {
  constructor(path, options) {
    this.path = path;
    this.component = options.component;
    this.children = options.children || null;
    this.action = options.action;
  }

  getRoutes() {
    return [...this.children];
  }

  setRoutes(routes) {
    ensureRoutes(routes);
    this.children = [...toArray(routes)];
  }

  addRoutes(routes) {
    ensureRoutes(routes);
    this.children = this.children || [];
    this.children.push(...toArray(routes));
  }

  removeRoutes(routes) {
    toArray(routes).forEach(route => {
      const index = this.children.indexOf(route);
      if (index > -1) {
        this.children.splice(index, 1);
      }
    });
  }
}

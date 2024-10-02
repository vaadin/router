import type { AnyObject } from './resolver/types.js';
import { isFunction, isString, log, toArray } from './resolver/utils.js';
import type { Route } from './types.js';

export function ensureRoute<R extends AnyObject>(route?: Route<R>): void {
  if (!route || !isString(route.path)) {
    throw new Error(
      log(`Expected route config to be an object with a "path" string property, or an array of such objects`),
    );
  }

  const stringKeys = ['component', 'redirect'] as const;
  if (
    !isFunction(route.action) &&
    !Array.isArray(route.children) &&
    !isFunction(route.children) &&
    !stringKeys.some((key) => isString(route[key]))
  ) {
    throw new Error(
      log(
        `Expected route config "${route.path}" to include either "${stringKeys.join('", "')}" ` +
          `or "action" function but none found.`,
      ),
    );
  }

  if (route.redirect) {
    ['component'].forEach((overriddenProp) => {
      if (overriddenProp in route) {
        console.warn(
          log(
            `Route config "${route.path as string}" has both "redirect" and "${overriddenProp}" properties, ` +
              `and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`,
          ),
        );
      }
    });
  }
}

export function ensureRoutes<R extends AnyObject>(routes: Route<R> | ReadonlyArray<Route<R>>): void {
  toArray(routes).forEach((route) => ensureRoute(route));
}

export function fireRouterEvent<T>(type: string, detail: T): boolean {
  return !window.dispatchEvent(new CustomEvent(`vaadin-router-${type}`, { cancelable: type === 'go', detail }));
}

import type { Route } from './types/Route.js';

export const $command = Symbol('command');

export const notFoundResult = Symbol('NotFoundResult');
export type NotFoundResult = typeof notFoundResult;

export function isObject(o: unknown): o is object {
  // guard against null passing the typeof check
  return typeof o === 'object' && !!o;
}

export function isFunction(f: unknown): f is (...args: readonly unknown[]) => unknown {
  return typeof f === 'function';
}

export function isString(s: unknown): s is string {
  return typeof s === 'string';
}

export function toArray<T>(value: T | readonly T[] = []): readonly T[] {
  return Array.isArray(value) ? value : [value];
}

export function log(msg: string): string {
  return `[Vaadin.Router] ${msg}`;
}

export function ensureRoute<R extends object, C extends object>(route?: Route<R, C>): void {
  if (!route || !isString(route.path)) {
    throw new Error(
      log(`Expected route config to be an object with a "path" string property, or an array of such objects`),
    );
  }

  if (
    !isFunction(route.action) &&
    !Array.isArray(route.children) &&
    !isString(route.component) &&
    !isString(route.redirect)
  ) {
    throw new Error(
      log(
        `Expected route config "${route.path}" to include either "component, redirect" ` +
          `or "action" function but none found.`,
      ),
    );
  }

  if (route.redirect) {
    ['bundle', 'component'].forEach((overriddenProp) => {
      if (overriddenProp in route) {
        console.warn(
          log(
            `Route config "${String(route.path)}" has both "redirect" and "${overriddenProp}" properties, ` +
              `and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`,
          ),
        );
      }
    });
  }
}

export function ensureRoutes<R extends object, C extends object>(
  routes: Route<R, C> | ReadonlyArray<Route<R, C>>,
): void {
  toArray(routes).forEach((route) => ensureRoute(route));
}

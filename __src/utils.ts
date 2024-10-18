import type { Route as _Route } from '@ausginer/router';
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

export function log(msg: string): string {
  return `[Vaadin.Router] ${msg}`;
}

export function* traverse<T extends { children?: readonly T[] }>(routes: readonly T[] = []): IterableIterator<T> {
  for (const route of routes) {
    yield route;
    yield* traverse(route.children);
  }
}

const props = ['bundle', 'component'] as const;

export function ensureRoutes<R extends object, C extends object>(
  routes: Route<R, C> | ReadonlyArray<Route<R, C>>,
): ReadonlyArray<Route<R, C>> {
  const _routes = Array.isArray(routes) ? routes : [routes];

  for (const route of traverse(_routes)) {
    if (!isString(route.path)) {
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
      for (const prop of props) {
        if (prop in route) {
          console.warn(
            log(
              `Route config "${String(route.path)}" has both "redirect" and "${prop}" properties, ` +
                `and "redirect" will always override the latter. Did you mean to only use "${prop}"?`,
            ),
          );
        }
      }
    }
  }

  return _routes;
}

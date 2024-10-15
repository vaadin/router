import type { ChildrenCallback, Route, RouteContext } from './types.js';

/**
 * {@inheritDoc "<internal>".NotFoundError}
 */
export const notFoundResult = Symbol('NotFoundResult');

/**
 * A special result to be returned from a route action to indicate that the
 * route was not found.
 */
export type NotFoundResult = typeof notFoundResult;

/**
 * An error to be thrown when a route is not found.
 */
export class NotFoundError<T, R extends object, C extends object> extends Error {
  /**
   * The HTTP status code to be used when the route is not found.
   */
  readonly code: number;

  /**
   * The context object associated with the route that was not found.
   */
  readonly context: RouteContext<T, R, C>;

  constructor(context: RouteContext<T, R, C>) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    super(log(`Page not found (${context.pathname})`));
    this.context = context;
    this.code = 404;
  }
}

/** @internal */
export function isObject(o: unknown): o is object {
  // guard against null passing the typeof check
  return typeof o === 'object' && !!o;
}

/** @internal */
export function isFunction<F extends (...args: readonly never[]) => unknown>(f: unknown): f is F {
  return typeof f === 'function';
}

/** @internal */
export function isString(s: unknown): s is string {
  return typeof s === 'string';
}

/** @internal */
export function toArray<T>(value: T | readonly T[] = []): readonly T[] {
  return Array.isArray(value) ? value : [value];
}

/** @internal */
export function log(msg: string): string {
  return `[Vaadin.Router] ${msg}`;
}

/** @internal */
export function getNotFoundError<T, R extends object, C extends object>(
  context: RouteContext<T, R, C>,
): NotFoundError<T, R, C> {
  return new NotFoundError(context);
}

/** @internal */
export function resolvePath(path?: string | readonly string[]): string {
  return (Array.isArray(path) ? path[0] : path) ?? '';
}

/** @internal */
export function getRoutePath<T, R extends object, C extends object>(route: Route<T, R, C> | undefined): string {
  return resolvePath(route?.path);
}

/** @internal */
export function unwrapChildren<T, R extends object, C extends object>(
  children: ChildrenCallback<T, R, C> | ReadonlyArray<Route<T, R, C>> | undefined,
): ReadonlyArray<Route<T, R, C>> | undefined {
  return Array.isArray<ReadonlyArray<Route<T, R, C>>>(children) && children.length > 0 ? children : undefined;
}

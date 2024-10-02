import type { AnyObject, ChildrenCallback, Route, RouteContext } from './types.js';

export function isObject(o: unknown): o is object {
  // guard against null passing the typeof check
  return typeof o === 'object' && !!o;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(f: unknown): f is Function {
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

export class NotFoundError<T, R extends AnyObject, C extends AnyObject> extends Error {
  readonly code: number;
  readonly context: RouteContext<T, R, C>;

  constructor(context: RouteContext<T, R, C>) {
    super(log(`Page not found (${context.pathname})`));
    this.context = context;
    this.code = 404;
  }
}

export const notFoundResult = Symbol('NotFoundResult');
export type NotFoundResult = typeof notFoundResult;

export function getNotFoundError<T, R extends AnyObject, C extends AnyObject>(
  context: RouteContext<T, R, C>,
): NotFoundError<T, R, C> {
  return new NotFoundError(context);
}

export function resolvePath(path?: string | readonly string[]): string {
  return (Array.isArray(path) ? path[0] : path) ?? '';
}

export function getRoutePath<T, R extends AnyObject, C extends AnyObject>(route: Route<T, R, C> | undefined): string {
  return resolvePath(route?.path);
}

export function unwrapChildren<T, R extends AnyObject, C extends AnyObject>(
  children: ChildrenCallback<T, R, C> | ReadonlyArray<Route<T, R, C>> | undefined,
): ReadonlyArray<Route<T, R, C>> | undefined {
  return Array.isArray<ReadonlyArray<Route<T, R, C>>>(children) && children.length > 0 ? children : undefined;
}

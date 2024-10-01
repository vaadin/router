import type { AnyObject, ChildrenCallback, Route, RouteContext, RouteMeta } from './types.js';

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

export function logValue(value: unknown): string {
  if (typeof value !== 'object') {
    return String(value);
  }

  const [stringType = 'Unknown'] = / (.*)\]$/u.exec(String(value)) ?? [];
  if (stringType === 'Object' || stringType === 'Array') {
    return `${stringType} ${JSON.stringify(value)}`;
  }
  return stringType;
}

export class NotFoundError<T, R extends AnyObject> extends Error {
  readonly code: number;
  readonly context: RouteContext<T, R>;

  constructor(context: RouteContext<T, R>) {
    super(log(`Page not found (${context.pathname})`));
    this.context = context;
    this.code = 404;
  }
}

export const notFoundResult = Symbol('NotFoundResult');
export type NotFoundResult = typeof notFoundResult;

export function getNotFoundError<T = unknown, R extends Record<string, unknown> = AnyObject>(
  context: RouteContext<T, R>,
): NotFoundError<T, R> {
  return new NotFoundError(context);
}

export function resolvePath(path?: string | readonly string[]): string {
  return (Array.isArray(path) ? path[0] : path) ?? '';
}

export function getRoutePath<T, R extends AnyObject>(route: Route<T, R> | undefined): string {
  return resolvePath(route?.path);
}

export function unwrapChildren<T, R extends AnyObject>(
  children: ChildrenCallback<T, R> | ReadonlyArray<Route<T, R>> | undefined,
): ReadonlyArray<Route<T, R>> | undefined {
  return Array.isArray<ReadonlyArray<Route<T, R>>>(children) && children.length > 0 ? children : undefined;
}

export class RouteData<T, R extends AnyObject> extends Map<Route<T, R>, RouteMeta<T, R>> {
  readonly #inverted: Map<RouteMeta<T, R>, Route<T, R>>;

  constructor(entries?: ReadonlyArray<readonly [route: Route<T, R>, meta: RouteMeta<T, R>]> | null) {
    super(entries);
    this.#inverted = new Map(entries?.map(([route, meta]) => [meta, route]));
  }

  override set(key: Route<T, R>, value: RouteMeta<T, R>): this {
    this.#inverted.set(value, key);
    return super.set(key, value);
  }

  override delete(key: Route<T, R>): boolean {
    const value = this.get(key);
    if (value) {
      this.#inverted.delete(value);
    }
    return super.delete(key);
  }

  getRoute(meta: RouteMeta<T, R>): Route<T, R> | undefined {
    return this.#inverted.get(meta);
  }
}

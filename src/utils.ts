import type { InternalContext } from './internal.js';
import type { ChildrenCallback, NotFoundResult, Route, EmptyRecord } from './types.js';

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

export function ensureRoute(route?: Route): void {
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

export function ensureRoutes(routes: Route | readonly Route[]): void {
  toArray(routes).forEach((route) => ensureRoute(route));
}

export function fireRouterEvent<T>(type: string, detail: T): boolean {
  return !window.dispatchEvent(new CustomEvent(`vaadin-router-${type}`, { cancelable: type === 'go', detail }));
}

export class NotFoundError<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
> extends Error {
  readonly code: number;
  readonly context: InternalContext<T, R, C>;

  constructor(context: InternalContext<T, R, C>) {
    super(log(`Page not found (${context.pathname})`));
    this.context = context;
    this.code = 404;
  }
}

export function getNotFoundError<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
>(context: InternalContext<T, R, C>): NotFoundError<T, R, C> {
  return new NotFoundError(context);
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const notFoundResult = {} as NotFoundResult;

export function resolvePath(path?: string | readonly string[]): string {
  return (Array.isArray(path) ? path[0] : path) ?? '';
}

export function getRoutePath(route: Route | undefined): string {
  return resolvePath(route?.path);
}

export function unwrapChildren<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
>(children: ChildrenCallback | ReadonlyArray<Route<T, R, C>> | undefined): ReadonlyArray<Route<T, R, C>> {
  return Array.isArray<ReadonlyArray<Route<T, R, C>>>(children) ? children : [];
}

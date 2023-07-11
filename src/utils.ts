import type { Context, NotFoundResult, Route } from "./types.js";

export function toArray<T>(value: T | readonly T[] = []): readonly T[] {
  return Array.isArray(value) ? (value as readonly T[]) : [value as T];
}

export function log(msg: string): string {
  return `[Vaadin.Router] ${msg}`;
}

export function logValue(value: unknown): string {
  if (typeof value !== 'object') {
    return String(value);
  }

  const [stringType= 'Unknown'] = String(value).match(/ (.*)\]$/u) ?? [];
  if (stringType === 'Object' || stringType === 'Array') {
    return `${stringType} ${JSON.stringify(value)}`;
  } else {
    return stringType;
  }
}

export function ensureRoute(route: Route) {
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
            `Route config "${route.path}" has both "redirect" and "${overriddenProp}" properties, ` +
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

export function isObject(o: unknown): o is object {
  // guard against null passing the typeof check
  return typeof o === 'object' && !!o;
}

export function isFunction(f: unknown): f is Function {
  return typeof f === 'function';
}

export function isString(s: unknown): s is string {
  return typeof s === 'string';
}

export class NotFoundError extends Error {
  readonly context: Context
  readonly code: number;

  constructor(context: Context) {
    super(log(`Page not found (${context.pathname})`));
    this.context = context;
    this.code = 404;
  }
}

export function getNotFoundError(context: Context): NotFoundError {
  return new NotFoundError(context);
}

export const notFoundResult = {} as NotFoundResult;

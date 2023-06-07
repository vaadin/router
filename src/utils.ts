import type {ActionResult, Context, InternalRoute, Route} from "./types/route.js";
import type Resolver from "./resolver/resolver.js";

export function toArray<T>(objectOrArray: T | T[]): T[] {
  objectOrArray = objectOrArray || [];
  return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
}

export function log(msg: string): string {
  return `[Vaadin.Router] ${msg}`;
}

export function logValue(value: unknown): string {
  if (typeof value !== 'object') {
    return String(value);
  }

  const stringType = Object.prototype.toString.call(value).match(/ (.*)\]$/)![1];
  if (stringType === 'Object' || stringType === 'Array') {
    return `${stringType} ${JSON.stringify(value)}`;
  } else {
    return stringType;
  }
}

export function ensureRoute(route: unknown): asserts route is Route {
  if ((typeof route !== 'object') || !route || !('path' in route) || !isString(route.path)) {
    throw new Error(
      log(`Expected route config to be an object with a "path" string property, or an array of such objects`)
    );
  }

  const routeCandidate = route as Partial<Route> & Record<string, string>;

  const stringKeys = ['component', 'redirect'];
  if (
    !isFunction(routeCandidate.action) &&
    !Array.isArray(routeCandidate.children) &&
    !isFunction(routeCandidate.children) &&
    !stringKeys.some(key => isString(routeCandidate[key]))
  ) {
    throw new Error(
      log(
        `Expected route config "${routeCandidate.path}" to include either "${stringKeys.join('", "')}" ` +
        `or "action" function but none found.`
      )
    );
  }

  if (routeCandidate.redirect) {
    ['component'].forEach(overriddenProp => {
      if (overriddenProp in routeCandidate) {
        console.warn(
          log(
            `Route config "${routeCandidate.path}" has both "redirect" and "${overriddenProp}" properties, ` +
            `and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`
          )
        );
      }
    });
  }
}

export function ensureRoutes(routes: unknown): asserts routes is Route | Route[] {
  toArray(routes).forEach(route => ensureRoute(route));
}

export function fireRouterEvent(type: string, detail?: unknown) {
  return !window.dispatchEvent(new CustomEvent(
    `vaadin-router-${type}`,
    {cancelable: type === 'go', detail}
  ));
}

export function isObject(o: any): o is object {
  // guard against null passing the typeof check
  return typeof o === 'object' && !!o;
}

export function isFunction(f: any): f is InstanceType<typeof Function> {
  return typeof f === 'function';
}

export function isString(s: any): s is string {
  return typeof s === 'string';
}

export class NotFoundError extends Error {
  public readonly code = 404;

  constructor(public readonly context: Context) {
    super(log(`Page not found (${context.pathname})`));
  }
}

export function getNotFoundError(context: Context) {
  return new NotFoundError(context);
}

export const notFoundResult = new (class NotFoundResult {})();

export type ChainItem = {
  path: string,
  route: InternalRoute,
  element?: Element,
};

export type ResolveResult =
  InternalContext
  | Readonly<{ result: ActionResult | typeof notFoundResult }>
  | ActionResult
  | typeof notFoundResult;

export type InternalContextNextFn =
  (resume?: boolean, parent?: InternalRoute, prevResult?: ResolveResult | null) => Promise<InternalContext>;

export type InternalContext = Omit<Context, 'next'> & {
  next: InternalContextNextFn;
  resolver?: Resolver,
  route?: InternalRoute,
  chain?: ChainItem[],
  result?: ActionResult | Error,
  __redirectCount?: number,
  __renderId?: number,
  __skipAttach?: boolean,
  __divergedChainIndex?: number,
};

export type ContextWithChain = InternalContext & {
  chain: ChainItem[],
  __divergedChainIndex: number,
};

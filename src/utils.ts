import {ActionResult, Context, Route} from "./types/route";
import Resolver from "./resolver/resolver";

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

  const stringType = Object.prototype.toString.call(value).match(/ (.*)\]$/)[1];
  if (stringType === 'Object' || stringType === 'Array') {
    return `${stringType} ${JSON.stringify(value)}`;
  } else {
    return stringType;
  }
}

export function ensureRoute(route: unknown): asserts route is Route {
  if (!route || !isString(route.path)) {
    throw new Error(
      log(`Expected route config to be an object with a "path" string property, or an array of such objects`)
    );
  }

  const stringKeys = ['component', 'redirect'];
  if (
    !isFunction(route.action) &&
    !Array.isArray(route.children) &&
    !isFunction(route.children) &&
    !stringKeys.some(key => isString(route![key]))
  ) {
    throw new Error(
      log(
        `Expected route config "${route.path}" to include either "${stringKeys.join('", "')}" ` +
        `or "action" function but none found.`
      )
    );
  }

  if (route.redirect) {
    ['component'].forEach(overriddenProp => {
      if (overriddenProp in route) {
        console.warn(
          log(
            `Route config "${route.path}" has both "redirect" and "${overriddenProp}" properties, ` +
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
  route: Route,
  element?: Element,
};

export type ResolveResult =
  InternalContext
  | Readonly<{ result: ActionResult | typeof notFoundResult }>
  | ActionResult
  | typeof notFoundResult;

export type InternalContextNextFn =
  (resume?: boolean, parent?: Route, prevResult?: ResolveResult | null) => Promise<InternalContext>;

export type InternalContext = Omit<Context, 'next'> & {
  next: InternalContextNextFn;
  resolver: Resolver,
  chain?: ChainItem[],
  result?: ActionResult | Error,
  __redirectCount?: number,
  __renderId?: number,
  __skipAttach?: boolean,
  __divergedChainIndex?: number,
};

export type ContextWithChain = InternalContext & {
  chain: ChainItem[],
};

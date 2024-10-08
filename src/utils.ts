import { compile } from 'path-to-regexp';
import type Resolver from './resolver/resolver.js';
import { isFunction, isObject, isString, log, toArray } from './resolver/utils.js';
import type { Router } from './router.js';
import type {
  ActionResult,
  AnyObject,
  ChainItem,
  IndexedParams,
  RedirectResult,
  Route,
  RouteContext,
  RouterLocation,
  WebComponentInterface,
} from './types.js';

export function ensureRoute<R extends AnyObject, C extends AnyObject>(route?: Route<R, C>): void {
  if (!route || !isString(route.path)) {
    throw new Error(
      log(`Expected route config to be an object with a "path" string property, or an array of such objects`),
    );
  }

  if (
    !isFunction(route.action) &&
    !Array.isArray(route.children) &&
    !isFunction(route.children) &&
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

export function ensureRoutes<R extends AnyObject, C extends AnyObject>(
  routes: Route<R, C> | ReadonlyArray<Route<R, C>>,
): void {
  toArray(routes).forEach((route) => ensureRoute(route));
}

export function copyContextWithoutNext<R extends AnyObject, C extends AnyObject>({
  next: _,
  ...context
}: RouteContext<R, C>): Omit<RouteContext<R, C>, 'next'> {
  return context;
}

export function getPathnameForRouter<T, R extends AnyObject, C extends AnyObject>(
  pathname: string,
  router: Resolver<T, R, C>,
): string {
  // @ts-expect-error: __effectiveBaseUrl is a private property
  const base = router.__effectiveBaseUrl;
  return base ? new URL(pathname.replace(/^\//u, ''), base).pathname : pathname;
}

export function getMatchedPath(pathItems: ReadonlyArray<Readonly<{ path: string }>>): string {
  return pathItems
    .map((pathItem) => pathItem.path)
    .reduce((a, b) => {
      if (b.length) {
        return `${a.replace(/\/$/u, '')}/${b.replace(/^\//u, '')}`;
      }
      return a;
    }, '');
}

export function getRoutePath<R extends AnyObject, C extends AnyObject>(chain: ReadonlyArray<ChainItem<R, C>>): string {
  return getMatchedPath(chain.map((chainItem) => chainItem.route));
}

export type ResolverOnlyContext<R extends AnyObject, C extends AnyObject> = Readonly<{ resolver: Router<R, C> }>;

type PartialRouteContext<R extends AnyObject, C extends AnyObject> = Readonly<{
  chain?: ReadonlyArray<ChainItem<R, C>>;
  hash?: string;
  params?: IndexedParams;
  pathname?: string;
  resolver?: Router<R, C>;
  redirectFrom?: string;
  search?: string;
}>;

export function createLocation<R extends AnyObject, C extends AnyObject>({
  resolver,
}: ResolverOnlyContext<R, C>): RouterLocation<R, C>;
export function createLocation<R extends AnyObject, C extends AnyObject>(
  context: RouteContext<R, C>,
  route?: Route<R, C>,
): RouterLocation<R, C>;
export function createLocation<R extends AnyObject, C extends AnyObject>(
  { chain = [], hash = '', params = {}, pathname = '', redirectFrom, resolver, search = '' }: PartialRouteContext<R, C>,
  route?: Route<R, C>,
): RouterLocation<R, C> {
  const routes = chain.map((item) => item.route);
  return {
    baseUrl: resolver?.baseUrl ?? '',
    getUrl: (userParams = {}) =>
      resolver ? getPathnameForRouter(compile(getRoutePath(chain))({ ...params, ...userParams } as Partial<Record<string, string[]>>), resolver) : '',
    hash,
    params,
    pathname,
    redirectFrom,
    route: route ?? (Array.isArray(routes) ? routes.at(-1) : undefined) ?? null,
    routes,
    search,
    searchParams: new URLSearchParams(search),
  };
}

export function createRedirect<R extends AnyObject, C extends AnyObject>(
  context: RouteContext<R, C>,
  pathname: string,
): RedirectResult {
  const params = { ...context.params };
  return {
    redirect: {
      from: context.pathname,
      params,
      pathname,
    },
  };
}

export function renderElement<R extends AnyObject, C extends AnyObject, E extends WebComponentInterface<R, C>>(
  context: RouteContext<R, C>,
  element: E,
): E {
  element.location = createLocation(context);

  if (context.chain) {
    const index = context.chain.map((item) => item.route).indexOf(context.route);
    context.chain[index].element = element;
  }

  return element;
}

export function maybeCall<R, A extends unknown[], O extends object>(
  callback: ((this: O, ...args: A) => R) | undefined,
  thisArg: O,
  ...args: A
): R | undefined {
  if (typeof callback === 'function') {
    return callback.apply(thisArg, args);
  }

  return undefined;
}

export function amend<
  A extends readonly unknown[],
  N extends keyof O,
  O extends AnyObject & { [key in N]: (this: O, ...args: A) => ActionResult | undefined },
>(fn: keyof O, obj: O | undefined, ...args: A): (result: ActionResult) => ActionResult | undefined {
  return (result: ActionResult) => {
    if (result && isObject(result) && ('cancel' in result || 'redirect' in result)) {
      return result;
    }

    return maybeCall(obj?.[fn], obj!, ...args);
  };
}

export function processNewChildren<R extends AnyObject, C extends AnyObject>(
  newChildren: Route<R, C> | ReadonlyArray<Route<R, C>> | undefined | void,
  route: Route<R, C>,
): void {
  if (!Array.isArray(newChildren) && !isObject(newChildren)) {
    throw new Error(
      log(
        `Incorrect "children" value for the route ${String(route.path)}: expected array or object, but got ${String(
          newChildren,
        )}`,
      ),
    );
  }

  const children = toArray(newChildren);
  children.forEach((child) => ensureRoute(child));
  route.__children = children;
}

export function fireRouterEvent(type: string, detail: unknown): boolean {
  return !window.dispatchEvent(new CustomEvent(`vaadin-router-${type}`, { cancelable: type === 'go', detail }));
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

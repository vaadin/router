import { compile } from 'path-to-regexp';
import type { ChainItem, InternalRoute, InternalRouteContext } from './internal.js';
import type Resolver from './resolver/resolver.js';
import type {
  ActionResult,
  AnyObject,
  Route,
  RouteChildrenContext,
  RouteContext,
  RouterLocation,
  WebComponentInterface,
} from './types.js';
import { ensureRoute, isObject, log, toArray } from './resolver/utils.js';

export function copyContextWithoutNext<R extends AnyObject>({
  next: _,
  ...context
}: RouteContext<R>): RouteChildrenContext<R> {
  return context;
}

export function getPathnameForRouter<R extends AnyObject>(pathname: string, router: Resolver<R>): string {
  // @ts-expect-error: __effectiveBaseUrl is a private property
  const base = router.__effectiveBaseUrl;
  return base ? new URL(pathname.replace(/^\//u, ''), base).pathname : pathname;
}

export function getMatchedPath<R extends AnyObject>(chain: ReadonlyArray<ChainItem<R>>): string {
  return chain
    .map((item) => item.path)
    .reduce((a, b) => {
      if (b.length) {
        return `${a.replace(/\/$/u, '')}/${b.replace(/^\//u, '')}`;
      }
      return a;
    }, '');
}

export function createLocation<R extends AnyObject>(
  { chain = [], hash = '', params = {}, pathname = '', redirectFrom, resolver, search = '' }: InternalRouteContext<R>,
  route?: Route<R>,
): RouterLocation {
  const routes = chain.map((item) => item.route).filter((item) => item != null);
  return {
    baseUrl: resolver?.baseUrl ?? '',
    getUrl: (userParams = {}) =>
      resolver ? getPathnameForRouter(compile(getMatchedPath(chain))({ ...params, ...userParams }), resolver) : '',
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

export function createRedirect<R extends AnyObject>(context: InternalRouteContext<R>, pathname: string): ActionResult {
  const params = { ...context.params };
  return {
    redirect: {
      from: context.pathname,
      params,
      pathname,
    },
  };
}

export function renderElement<T extends WebComponentInterface, R extends AnyObject>(
  context: InternalRouteContext<R>,
  element: T,
): T {
  element.location = createLocation(context);

  if (context.chain) {
    const index = context.chain.map((item) => item.route).indexOf(context.route);
    context.chain[index].element = element;
  }

  return element;
}

export function maybeCall<R, A extends unknown[], O extends object>(
  callback: (this: O, ...args: A) => R,
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
  N extends keyof E,
  E extends WebComponentInterface & { [key in N]: (this: E, ...args: A) => ActionResult | undefined },
>(amendmentFunction: keyof E, element: E | undefined, ...args: A): (result: ActionResult) => ActionResult | undefined {
  return (amendmentResult: ActionResult) => {
    if (amendmentResult && ('cancel' in amendmentResult || 'redirect' in amendmentResult)) {
      return amendmentResult;
    }

    if (element) {
      return maybeCall(element[amendmentFunction], element, ...args);
    }

    return undefined;
  };
}

export function processNewChildren<R extends AnyObject>(
  newChildren: ReadonlyArray<InternalRoute<R>>,
  route: InternalRoute<R>,
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

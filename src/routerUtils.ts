import { compile } from 'path-to-regexp';
import type { ChainItem, InternalRoute, InternalRouteContext } from './internal.js';
import { Router } from './router.js';
import type {
  ActionResult,
  AnyObject,
  Route,
  RouteChildrenContext,
  RouteContext,
  WebComponentInterface,
} from './types.js';
import { ensureRoute, isObject, log, toArray } from './utils.js';

export function copyContextWithoutNext<R extends AnyObject>({
  next: _,
  ...context
}: RouteContext<R>): RouteChildrenContext<R> {
  return context;
}

export function getPathnameForRouter<R extends AnyObject>(pathname: string, router: Router<R>) {
  const base = router.__effectiveBaseUrl;
  return base ? new URL(pathname.replace(/^\//u, ''), base).pathname : pathname;
}

export function getMatchedPath<R extends AnyObject>(chain: ReadonlyArray<ChainItem<R>>) {
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
) {
  const routes = chain.map((item) => item.route);
  return {
    baseUrl: resolver?.baseUrl ?? '',
    getUrl: (userParams = {}) =>
      getPathnameForRouter(compile(getMatchedPath(routes))({ ...params, ...userParams }), resolver),
    hash,
    params,
    pathname,
    redirectFrom,
    route: route ?? (routes.length && routes[routes.length - 1]) ?? null,
    routes,
    search,
    searchParams: new URLSearchParams(search),
  };
}

export function createRedirect<R extends AnyObject>(context: InternalRouteContext<R>, pathname: string) {
  const params = { ...context.params };
  return {
    redirect: {
      from: context.pathname,
      params,
      pathname,
    },
  };
}

export function renderElement<R extends AnyObject>(context: InternalRouteContext<R>, element: HTMLElement) {
  element.location = createLocation(context);
  const index = context.chain.map((item) => item.route).indexOf(context.route);
  context.chain[index].element = element;
  return element;
}

export function maybeCall<R, A extends readonly unknown[], O extends object>(
  callback: (this: O, ...args: A) => R,
  thisArg: O,
  ...args: A
): R | undefined {
  if (typeof callback === 'function') {
    return callback.apply(thisArg, args);
  }
}

export function amend<
  A extends readonly unknown[],
  N extends keyof E,
  E extends WebComponentInterface & { [key in N]: (this: E, ...args: A) => ActionResult | undefined },
>(amendmentFunction: keyof E, element: E | undefined, ...args: A): (result: ActionResult) => ActionResult | undefined {
  return (amendmentResult: ActionResult) => {
    if (amendmentResult && (amendmentResult.cancel || amendmentResult.redirect)) {
      return amendmentResult;
    }

    if (element) {
      return maybeCall(element[amendmentFunction], element, ...args);
    }
  };
}

export function processNewChildren<R extends AnyObject>(
  newChildren: ReadonlyArray<InternalRoute<R>>,
  route: InternalRoute<R>,
) {
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

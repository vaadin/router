// eslint-disable-next-line
/// <reference types="urlpattern-polyfill"
import type { EmptyRecord, Route as _Route } from '@ausginer/router';
import type { RequireAtLeastOne } from 'type-fest';
import type {
  AnimateCustomClasses,
  Commands,
  IndexedParams,
  MaybePromise,
  NotFoundResult,
  PreventResult,
  RedirectResult,
} from '../src/types.js';

export type ActionResult<T> = HTMLElement | NotFoundResult | PreventResult | RedirectResult | T | null | undefined;

export type Redirect = Readonly<{
  redirect: string;
}>;

export type Route<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
> = Readonly<
  RequireAtLeastOne<{
    children?: ReadonlyArray<Route<T, R, C>>;
    component?: string;
    redirect?: string;
    action?(this: Route<T, R, C>, context: RouteContext, commands?: Commands): MaybePromise<ActionResult<T>>;
  }> & {
    animate?: AnimateCustomClasses | boolean;
    name?: string;
    path: RegExp | string;
  }
>;

export type RouteContext<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
> = C &
  Readonly<{
    hash: string;
    params: IndexedParams;
    pathname: string;
    route: Route<T, R, C>;
    search: string;
    next(resume?: boolean): Promise<ActionResult<T>>;
  }>;

export function convertRoute<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
>(route: Route<T, R, C>): _Route<ActionResult<T> | Redirect, R, C> {
  const { action, animate, children, component, name, path, redirect, ...other } = route;

  const _path = typeof path === 'string' ? path : path.source;

  if (redirect != null) {
    return {
      action() {
        return { redirect };
      },
      path: _path,
      ...(other as R),
    };
  }

  if (component != null) {
    return {
      action() {
        return document.createElement(component);
      },
      path: _path,
      ...(other as R),
    };
  }

  if (children != null) {
    return {
      children: children.map(convertRoute),
      path: _path,
      ...(other as R),
    };
  }

  return {
    async action({ next, result: { hash, pathname, search } }) {
      return action?.call(route, {
        hash: hash.input,
        next,
        params: pathname.groups,
        pathname: pathname.input,
        route,
        search: search.input,
      });
    },
    path: _path,
    ...(other as R),
  };
}

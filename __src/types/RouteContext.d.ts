import type { RouterContext as _RouterContext, EmptyObject } from '@ausginer/router';
import type { Router } from '../router.js';
import type { ActionResult, IndexedParams, InternalResult } from './general.js';
import type { Route } from './Route.js';
import type { WebComponentInterface } from './WebComponentInterface.js';

export type ChainItem<R extends object, C extends object> = {
  element?: WebComponentInterface<R, C>;
  route: Route<R, C>;
};

export type RouteContext<R extends object = EmptyObject, C extends object = EmptyObject> = C &
  Readonly<{
    pathname: string;
    hash?: string;
    search?: string;
    searchParams?: URLSearchParams;
    chain?: ReadonlyArray<Route<R, C>>;
    params: IndexedParams;
    resolver: Router<R, C>;
    redirectFrom?: string;
    result?: ActionResult;
    route: Route<R, C>;
    next(resume?: boolean): Promise<ActionResult | null | undefined>;
  }>;

export type InternalRouteContext<R extends object, C extends object> = _RouterContext<InternalResult<R, C>, R, C>;

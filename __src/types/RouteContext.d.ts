import type { AnyObject, EmptyObject } from '@ausginer/router';
import type { Router } from '../router.js';
import type { ActionResult, IndexedParams, Result } from './general.js';
import type { Route } from './Route.js';
import type { WebComponentInterface } from './WebComponentInterface.js';

export type ChainItem<R extends AnyObject, C extends AnyObject> = {
  element?: WebComponentInterface<R, C>;
  path: string;
  route: Route<R, C>;
};

export type RouteContext<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = Readonly<{
  pathname: string;
  hash?: string;
  search?: string;
  chain?: Array<ChainItem<R, C>>;
  params: IndexedParams;
  resolver?: Router<R, C>;
  redirectFrom?: string;
  route: Route<R, C>;
  next(
    resume?: boolean,
    parent?: Route<R, C>,
    prevResult?: Result<RouteContext<R, C>>,
  ): Promise<Result<RouteContext<R, C>>>;
}> & {
  __divergedChainIndex?: number;
  __redirectCount?: number;
  __renderId: number;
  __skipAttach?: boolean;
  result?: ActionResult | RouteContext<R, C>;
} & C;

import type { EmptyObject } from 'type-fest';
import type Resolver from './resolver.js';
import type { NotFoundResult } from './utils.js';

/* ========================
 *  Common Types
 * ======================== */
export type AnyObject = Readonly<Record<never, never>>;

export type MaybePromise<T> = Promise<T> | T;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ActionResult<T> = T | NotFoundResult | null | undefined | void;

/* ========================
 *  Resolver-Specific Types
 * ======================== */
export type ChildrenCallback<T, R extends AnyObject, C extends AnyObject> = (
  context: RouteChildrenContext<T, R, C>,
) => MaybePromise<Route<T, R, C> | ReadonlyArray<Route<T, R, C>> | void>;

export type BasicRoutePart<T, R extends AnyObject, C extends AnyObject> = Readonly<{
  name?: string;
  path: string;
  action?(
    this: Route<T, R, C>,
    context: RouteContext<T, R, C>,
    commands: never,
  ): MaybePromise<ActionResult<T | RouteContext<T, R, C>>>;
}> & {
  __children?: ReadonlyArray<Route<T, R, C>>;
  __synthetic?: true;
  children?: ReadonlyArray<Route<T, R, C>> | ChildrenCallback<T, R, C>;
  parent?: Route<T, R, C>;
  fullPath?: string;
};

export type Route<T = unknown, R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = BasicRoutePart<
  T,
  R,
  C
> &
  R;

export type Match<T, R extends AnyObject, C extends AnyObject> = Readonly<{
  path: string;
  route?: Route<T, R, C>;
}>;

export type ChainItem<T, R extends AnyObject, C extends AnyObject> = {
  element?: Element;
  path: string;
  route: Route<T, R, C>;
};

export type ResolveContext<C extends AnyObject = EmptyObject> = Readonly<{
  pathname: string;
}> &
  C;

export type RouteContext<T, R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = Readonly<{
  hash?: string;
  search?: string;
  chain?: Array<ChainItem<T, R, C>>;
  params: IndexedParams;
  resolver?: Resolver<T, R, C>;
  redirectFrom?: string;
  route: Route<T, R, C>;
  next(
    resume?: boolean,
    parent?: Route<T, R, C>,
    prevResult?: ActionResult<RouteContext<T, R, C>>,
  ): Promise<ActionResult<RouteContext<T, R, C>>>;
}> & {
  __divergedChainIndex?: number;
  __redirectCount?: number;
  __renderId: number;
  __skipAttach?: boolean;
  result?: T | RouteContext<T, R, C>;
} & ResolveContext<C>;

export type RouteChildrenContext<T, R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = Omit<
  RouteContext<T, R, C>,
  'next'
>;

export type PrimitiveParamValue = string | number | null;

export type ParamValue = PrimitiveParamValue | readonly PrimitiveParamValue[];

export type IndexedParams = Readonly<Record<string, ParamValue>>;

export type Params = IndexedParams | ParamValue[];

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
  context: RouteContext<T, R, C>,
) => MaybePromise<ReadonlyArray<Route<T, R, C>>>;

export type BasicRoutePart<T, R extends AnyObject, C extends AnyObject> = Readonly<{
  children?: ReadonlyArray<Route<T, R, C>> | ChildrenCallback<T, R, C>;
  name?: string;
  path: string;
  action?(this: Route<T, R, C>, context: RouteContext<T, R, C>): MaybePromise<ActionResult<T>>;
}> & {
  __children?: ReadonlyArray<Route<T, R, C>>;
  __synthetic?: true;
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
}>;

export type ResolutionOptions = Readonly<{
  pathname: string;
}>;

export type RouteContext<T, R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> = ResolutionOptions &
  Readonly<{
    __divergedChainIndex?: number;
    __redirectCount?: number;
    __renderId: number;
    __skipAttach?: boolean;
    hash?: string;
    search?: string;
    chain?: Array<ChainItem<T, R, C>>;
    params: IndexedParams;
    resolver?: Resolver<T, R, C>;
    redirectFrom?: string;
    result?: T;
    route?: Route<T, R, C>;
    next?(
      resume?: boolean,
      parent?: Route<T, R, C>,
      prevResult?: T | null,
    ): Promise<ActionResult<RouteContext<T, R, C>>>;
  }>;

export type PrimitiveParamValue = string | number | null;

export type ParamValue = PrimitiveParamValue | readonly PrimitiveParamValue[];

export type IndexedParams = Readonly<Record<string, ParamValue>>;

export type Params = IndexedParams | ParamValue[];

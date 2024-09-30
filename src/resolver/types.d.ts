/* ========================
 *  Common Types
 * ======================== */

export type AnyObject = Record<never, never>;

export type MaybePromise<T> = Promise<T> | T;

export type ActionResult<T> = T | null | undefined | MaybePromise<T | null | undefined>;

/* ========================
 *  Resolver-Specific Types
 * ======================== */
export type Route<T = unknown, R extends AnyObject = EmptyObject> = Readonly<{
  __children?: ReadonlyArray<Route<T, R>>;
  __synthetic?: true;
  name?: string;
  path?: string | readonly string[];
  fullPath?: string;
  parent?: Route<T, R>;
  children?: ReadonlyArray<Route<T, R>> | ChildrenCallback<T, R>;
  action?(this: Route<T, R>, context: RouteContext<T, R>): ActionResult<T>;
}>;

export type Match<T, R extends AnyObject> = Readonly<{
  path: string;
  route?: Route<T, R>;
}>;

export type ChainItem<T, R extends AnyObject> = Readonly<{
  element?: Element;
  path: string;
  route?: Route<T, R>;
}>;

export type ResolutionOptions = Readonly<{
  pathname: string;
}>;

export type RouteContext<T, R extends AnyObject = EmptyObject> = ResolutionOptions &
  Readonly<{
    __divergedChainIndex?: number;
    __redirectCount?: number;
    __renderId: number;
    __skipAttach?: boolean;
    hash?: string;
    search?: string;
    chain?: Array<ChainItem<T, R>>;
    params: IndexedParams;
    resolver?: Resolver<T, R>;
    redirectFrom?: string;
    result?: T;
    route?: Route<T, R>;
    search?: string;
    next?(resume?: boolean, parent?: Route<T, R>, prevResult?: T | null): Promise<RouteContext<T>>;
  }>;

export type ChildrenCallback<T, R extends AnyObject> = (
  context: RouteChildrenContext<T, R>,
) => MaybePromise<ReadonlyArray<Route<T, R>>>;

export type ParamValue = readonly string[] | string;

export type IndexedParams = Readonly<{
  [key in keyof any]?: ParamValue;
}>;

export type Params = IndexedParams | ParamValue[];

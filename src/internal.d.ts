import type Resolver from './resolver/resolver.js';
import type { ActionResult, Route, AnyObject, WebComponentInterface, RouteChildrenContext } from './types.js';

export interface RegExpExecOptArray extends ReadonlyArray<string | undefined> {
  0: string;
  index: number;
  input: string;
}

/** Extract from T those types that has K keys  */
type ExtractByKey<T, K extends keyof any> = T extends infer R ? (K extends keyof R ? R : never) : never;

type KeyofUnion<T> = T extends infer R ? keyof R : never;

// TODO: Remove when https://github.com/microsoft/TypeScript/issues/44253 is
//  resolved
declare global {
  interface ObjectConstructor {
    hasOwn<T extends Record<keyof any, any>, K extends keyof any>(
      o: T,
      v: K,
    ): o is K extends KeyofUnion<T> ? ExtractByKey<T, K> : T & { [P in K]: unknown };
  }
}

export type InternalRoute<R extends AnyObject> = Route<R> & {
  __children?: ReadonlyArray<InternalRoute<R>>;
  __synthetic?: true;
  fullPath?: string;
  parent?: InternalRoute<R>;
};

export type ChainItem<R extends AnyObject> = {
  element?: WebComponentInterface<R>;
  path: string;
  route?: InternalRoute<R>;
};

export type ResolveResult<R extends Record<string, unknown>> = ActionResult | InternalRouteContext<R>;

export type InternalNextResult<R extends AnyObject> = ResolutionResult<InternalRouteContext<R>>;

export type InternalRouteContext<R extends AnyObject> = RouteChildrenContext<R> & {
  __divergedChainIndex?: number;
  __redirectCount?: number;
  __renderId: number;
  __skipAttach?: boolean;
  chain?: Array<ChainItem<R>>;
  resolver?: Resolver<R>;
  redirectFrom?: string;
  result?: ActionResult;
  route?: InternalRoute<R>;
  next(resume?: boolean, parent?: InternalRoute<R>, prevResult?: ActionResult | null): Promise<InternalNextResult<R>>;
};

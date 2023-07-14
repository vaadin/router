import type Resolver from './resolver/resolver.js';
import type { ActionResult, RouteContext, EmptyRecord, Route } from './types.js';

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

export type InternalRoute<T, R extends Record<string, unknown>, C extends Record<string, unknown>> = Route<T, R, C> & {
  __children?: ReadonlyArray<InternalRoute<T, R, C>>;
  __synthetic?: true;
  fullPath?: string;
  parent?: InternalRoute<T, R, C>;
};

export type ChainItem<T, R extends Record<string, unknown>, C extends Record<string, unknown>> = {
  element?: Element;
  path: string;
  route?: InternalRoute<T, R, C>;
};

export type ResolveResult<T, R extends Record<string, unknown>, C extends Record<string, unknown>> =
  | ActionResult<T>
  | InternalContext<T, R, C>;

export type InternalContext<T, R extends Record<string, unknown>, C extends Record<string, unknown>> = RouteContext<
  T,
  R,
  C
> & {
  __divergedChainIndex?: number;
  __redirectCount?: number;
  __renderId?: number;
  __skipAttach?: boolean;
  chain?: Array<ChainItem<T, R, C>>;
  resolver?: Resolver<T, R, C>;
  result?: ActionResult<T> | Error;
  route?: InternalRoute<T, R, C>;
  next(
    resume?: boolean,
    parent?: InternalRoute<T, R, C>,
    prevResult?: ActionResult<T> | null,
  ): Promise<ActionResult<T>>;
};

import type { Route } from './types.js';

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

export type InternalRoute = Route & {
  fullPath?: string;
  parent?: InternalRoute;
  __children?: readonly InternalRoute[];
};

export interface RegExpExecOptArray extends ReadonlyArray<string | undefined> {
  index: number;
  input: string;
  0: string;
}

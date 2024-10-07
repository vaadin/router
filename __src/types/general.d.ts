import type { NotFoundResult } from '../utils.js';

export type MaybePromise<T> = Promise<T> | T;

export type Result<T> = T | NotFoundResult | null | undefined | void;

export type PrimitiveParamValue = string | number | null;

export type ParamValue = PrimitiveParamValue | readonly PrimitiveParamValue[];

export type IndexedParams = Readonly<Record<string, ParamValue>>;

export type Params = IndexedParams | ParamValue[];

export type RedirectContextInfo = Readonly<{
  from: string;
  params: IndexedParams;
  pathname: string;
}>;

export interface RedirectResult {
  readonly redirect: RedirectContextInfo;
}

export interface PreventResult {
  readonly cancel: true;
}

export type ActionValue = HTMLElement | PreventResult | RedirectResult;

export type ActionResult = Result<ActionValue>;

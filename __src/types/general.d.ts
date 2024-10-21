import type { Command, ComponentCommand } from '../internals/Commands.js';
import type { InternalRoute } from './Route.js';
import type { WebComponentInterface } from './WebComponentInterface.js';

export type PrimitiveParamValue = string | number | null | undefined;

export type ParamValue = PrimitiveParamValue | readonly PrimitiveParamValue[];

export type IndexedParams = Readonly<Record<string, ParamValue>>;

export type Params = IndexedParams | ParamValue[];

export type RedirectContextInfo = Readonly<{
  from: string;
  params: IndexedParams;
  pathname: string;
}>;

export type ActionResult = Command | null | undefined | void;

export type InternalResult<R extends object, C extends object> = Readonly<{
  element?: WebComponentInterface<R, C>;
  result?: ComponentCommand;
  route?: InternalRoute<R, C>;
}>;

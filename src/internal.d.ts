import { Route } from './types.js';

export type InternalRoute = Route & {
  fullPath?: string;
  parent?: InternalRoute;
  __children?: readonly InternalRoute[];
};

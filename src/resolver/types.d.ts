import type { EmptyObject } from 'type-fest';
import type Resolver from './resolver.js';
import type { NotFoundResult } from './utils.js';

/* ========================
 *  Common Types
 * ======================== */

/**
 * Represents either a value or a promise of a value.
 *
 * @typeParam T - The type of the value.
 */
export type MaybePromise<T> = Promise<T> | T;

/**
 * A result of a {@link Route.action}.
 *
 * @typeParam T - The type of the result.
 */
export type ActionResult<T> = T | NotFoundResult | null | undefined | void;

/* ========================
 *  Resolver-Specific Types
 * ======================== */

/**
 * A function that dynamically creates children of a route.
 *
 * @typeParam T - The type of the result produced by the route.
 * @typeParam R - The type of additional route-specific data. Defaults to an
 * empty object.
 * @typeParam C - The type of user-defined context-specific data. Defaults to an
 * empty object.
 *
 * @param context - The context of the current route.
 *
 * @deprecated The route children callback is deprecated and will be removed in
 * the next major version.
 *
 * @interface
 */
export type ChildrenCallback<T, R extends object, C extends object> = (
  context: RouteChildrenContext<T, R, C>,
) => MaybePromise<Route<T, R, C> | ReadonlyArray<Route<T, R, C>> | void>;

/**
 * Defines a single route.
 *
 * A route represents a single or multiple sections in the URL. It defines the
 * behavior of a page in response to URL updates. A route can act as a content
 * producer or as middleware for child routes.
 *
 * @typeParam T - The type of the result produced by the route.
 * @typeParam R - The type of additional route-specific data. Defaults to an
 * empty object.
 * @typeParam C - The type of user-defined context-specific data. Defaults to an
 * empty object.
 */
export type RouteBase<T, R extends object, C extends object> = Readonly<{
  /**
   * The name of the route.
   */
  name?: string;
  /**
   * The path pattern that the route matches.
   */
  path: string;
  /**
   * An action that is executed when the route is resolved.
   *
   * Actions are executed recursively from the root route to the child route and
   * can either produce content or perform actions before or after the child's
   * action.
   *
   * @param context - The context of the current route.
   *
   * @returns The result of the route resolution. It could be either a value
   * produced by the action or a new context to continue the resolution process.
   *
   * @internal
   */
  action?(
    this: Route<T, R, C>,
    context: RouteContext<T, R, C>,
    commands: never,
  ): MaybePromise<ActionResult<T | RouteContext<T, R, C>>>;
}> & {
  /** @internal */
  __children?: ReadonlyArray<Route<T, R, C>>;
  /** @internal */
  __synthetic?: true;
  children?: ReadonlyArray<Route<T, R, C>> | ChildrenCallback<T, R, C>;
  parent?: Route<T, R, C>;
  fullPath?: string;
};

/**
 * {@inheritDoc BasicRoutePart}
 * @interface
 */
export type Route<T = unknown, R extends object = EmptyObject, C extends object = EmptyObject> = RouteBase<T, R, C> & R;

/**
 * A matched route with its associated path.
 *
 * @typeParam T - The type of the result produced by the route.
 * @typeParam R - The type of additional route-specific data. Defaults to an
 * empty object.
 * @typeParam C - The type of user-defined context-specific data. Defaults to an
 * empty object.
 *
 * @internal
 */
export type Match<T, R extends object, C extends object> = Readonly<{
  /** The path of the matched route. */
  path: string;
  /** The route object associated with the matched path. */
  route?: Route<T, R, C>;
}>;

/**
 * An item of the resolved route sequence.
 *
 * @typeParam T - The type of the result produced by the route.
 * @typeParam R - The type of additional route-specific data. Defaults to an
 * empty object.
 * @typeParam C - The type of user-defined context-specific data. Defaults to an
 * empty object.
 *
 * @interface
 */
export type ChainItem<T, R extends object, C extends object> = {
  /** A DOM element associated with the route. */
  element?: Element;
  /** The path of the route. */
  path: string;
  /** The route object containing route-specific information. */
  route: Route<T, R, C>;
};

/**
 * The context for a `resolve` operation that can be extended with
 * the user-defined properties.
 *
 * @typeParam C - The type of user-defined context-specific data. Defaults to an
 * empty object.
 *
 * @interface
 */
export type ResolveContext<C extends object = EmptyObject> = Readonly<{
  /** The current location. */
  pathname: string;
}> &
  C;

/**
 * The context for a {@link Route.action} that could be used to access the
 * route-specific data during the resolution process.
 *
 * @typeParam T - The type of the result produced by the route.
 * @typeParam R - The type of additional route-specific data. Defaults to
 * `EmptyObject`.
 * @typeParam C - The type of additional context-specific data. Defaults to
 * `EmptyObject`.
 *
 * @interface
 */
export type RouteContext<T, R extends object = EmptyObject, C extends object = EmptyObject> = Readonly<{
  /**
   * The {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/hash | hash}
   * fragment of the URL.
   */
  hash?: string;
  /**
   * The {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/search | search}
   * query string of the URL.
   */
  search?: string;
  /**
   * The sequence of the resolved route items, so said the path from the root
   * route to the current route.
   */
  chain?: Array<ChainItem<T, R, C>>;
  /**
   * The parameters resolved from the current URL.
   */
  params: IndexedParams;
  /**
   * The resolver instance.
   */
  resolver?: Resolver<T, R, C>;
  /**
   * The URL from which a redirect occurred.
   */
  redirectFrom?: string;
  /**
   * The current route.
   */
  route: Route<T, R, C>;
  /**
   * Proceed to the next route in the chain, down the route tree.
   */
  next(
    resume?: boolean,
    parent?: Route<T, R, C>,
    prevResult?: ActionResult<RouteContext<T, R, C>>,
  ): Promise<ActionResult<RouteContext<T, R, C>>>;
}> & {
  /** @internal */
  __divergedChainIndex?: number;
  /** @internal */
  __redirectCount?: number;
  /** @internal */
  __renderId: number;
  /** @internal */
  __skipAttach?: boolean;
  /**
   * The result of the route resolution. It could be either a value produced by
   * the {@link Route.action} or a new context to continue the resolution
   * process.
   */
  result?: T | RouteContext<T, R, C>;
} & ResolveContext<C>;

/**
 * Represents the context that is accessible from the route children callback.
 * It is the a {@link RouteContext} without the 'next' property.
 *
 * @typeParam T - The type of the route parameters.
 * @typeParam R - The type of the route's resolved data. Defaults to `EmptyObject`.
 * @typeParam C - The type of the route's context. Defaults to `EmptyObject`.
 *
 * @deprecated The route children callback is deprecated and will be removed in
 * the next major version.
 *
 * @interface
 */
export type RouteChildrenContext<T, R extends object = EmptyObject, C extends object = EmptyObject> = Omit<
  RouteContext<T, R, C>,
  'next'
>;

export type PrimitiveParamValue = string | number | null;

/**
 * The value of a parameter resolved from the URL.
 */
export type ParamValue = PrimitiveParamValue | readonly PrimitiveParamValue[];

/**
 * The collection of parameters resolved from the URL.
 *
 * @remarks
 * Parameters are the parts of the URL represented by the placeholders in the
 * route path. Placeholders are often named, and these names become the keys of
 * the `IndexedParams` object.
 *
 * If a placeholder is unnamed, its index in the path becomes the key.
 */
export type IndexedParams = Readonly<Record<string, ParamValue>>;

export type Params = IndexedParams | ParamValue[];

/* eslint-disable max-classes-per-file */

import type { MaybePromise } from './resolver/types';
import type { RouteContext, Route, ActionResult, ChildrenCallback, WebComponentInterface } from './types';

/**
 * Action result describing an HTML element to render.
 *
 * @deprecated Use `HTMLElement`.
 */
export type ComponentResult = HTMLElement;

/**
 * Route resolution context object, see {@link RouteContext}.
 *
 * @deprecated Use {@link RouteContext}.
 */
export type Context = RouteContext;

/**
 * Route action callback function, see {@link Route.action}.
 *
 * @deprecated Use `NonNullable<Route['action']>`.
 */
export type ActionFn = (
  this: Route,
  context: RouteContext,
  commands: Commands,
) => MaybePromise<ActionResult | RouteContext>;

/**
 * Route children callback function, see {@link ChildrenCallback}.
 *
 * @deprecated Use {@link ChildrenCallback}.
 */
export type ChildrenFn = ChildrenCallback;

/**
 * Web component route interface with {@link onBeforeEnter} callback.
 *
 * @deprecated Use {@link WebComponentInterface}.
 */
export interface BeforeEnterObserver {
  /**
   * See {@link WebComponentInterface.onBeforeEnter}
   */
  onBeforeEnter: NonNullable<WebComponentInterface['onBeforeEnter']>;
}

/**
 * Web component route interface with {@link onBeforeLeave} callback.
 *
 * @deprecated Use {@link WebComponentInterface}.
 */
export interface BeforeLeaveObserver {
  /**
   * See {@link WebComponentInterface.onBeforeLeave}
   */
  onBeforeLeave: NonNullable<WebComponentInterface['onBeforeLeave']>;
}

/**
 * Web component route interface with {@link onAfterEnter} callback.
 *
 * @deprecated Use {@link WebComponentInterface}.
 */
export interface AfterEnterObserver {
  /**
   * See {@link WebComponentInterface.onAfterEnter}
   */
  onAfterEnter: NonNullable<WebComponentInterface['onAfterEnter']>;
}

/**
 * Web component route interface with {@link onAfterLeave} callback.
 *
 * @deprecated Use {@link WebComponentInterface}.
 */
export interface AfterLeaveObserver {
  /**
   * See {@link WebComponentInterface.onAfterLeave}
   */
  onAfterLeave: NonNullable<WebComponentInterface['onAfterLeave']>;
}

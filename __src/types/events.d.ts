import type { EmptyObject } from '@ausginer/router';
import type { ResolutionError } from '../internals/ResolutionError.js';
import type { Router } from '../router.js';
import type { RouteContext } from './RouteContext.js';
import type { RouterLocation } from '../internals/location.js';

export type VaadinRouterLocationChangedEvent = CustomEvent<
  Readonly<{
    location: RouterLocation;
    router: Router;
  }>
>;

export type VaadinRouterErrorEvent<R extends object = EmptyObject, C extends object = EmptyObject> = CustomEvent<
  Readonly<{
    error: ResolutionError<R, C>;
    router: Router<R, C>;
  }> &
    RouteContext<R, C>
>;

export type VaadinRouterGoEvent = CustomEvent<Pick<RouteContext, 'pathname'>>;

declare global {
  interface WindowEventMap {
    'vaadin-router-go': VaadinRouterGoEvent;
    'vaadin-router-location-changed': VaadinRouterLocationChangedEvent;
    'vaadin-router-error': VaadinRouterErrorEvent;
  }

  interface ArrayConstructor {
    isArray<T extends readonly unknown[]>(arg: unknown): arg is T;
  }
}

import type { EmptyObject } from '@ausginer/router';
import type { ResolutionError } from '../internals/ResolutionError.js';
import type { RouterLocation } from '../internals/RouterLocation.js';
import type { Router } from '../router.js';
import type { RouteContext } from './RouteContext.js';

export type EventDetails<T extends CustomEvent> = T['detail'];

export type VaadinRouterLocationChangedEvent<
  R extends object = EmptyObject,
  C extends object = EmptyObject,
> = CustomEvent<
  Readonly<{
    location: RouterLocation<R, C>;
    router: Router<R, C>;
  }>
>;

export type VaadinRouterErrorEvent<R extends object = EmptyObject, C extends object = EmptyObject> = CustomEvent<
  Readonly<{
    error: ResolutionError<R, C>;
    router: Router<R, C>;
  }> &
    RouteContext<R, C>
>;

export type VaadinRouterGoEvent<C extends object = EmptyObject> = CustomEvent<
  Readonly<{
    context?: Partial<C>;
    path: URL | string;
  }>
>;
export type VaadinRouterIgnoreEvent = CustomEvent<undefined>;

declare global {
  interface WindowEventMap {
    'vaadin-router-go': VaadinRouterGoEvent;
    'vaadin-router-location-changed': VaadinRouterLocationChangedEvent;
    'vaadin-router-ignore': VaadinRouterIgnoreEvent;
    'vaadin-router-error': VaadinRouterErrorEvent;
  }

  interface ArrayConstructor {
    isArray<T extends readonly unknown[]>(arg: unknown): arg is T;
  }
}

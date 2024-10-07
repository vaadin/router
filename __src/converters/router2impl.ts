import type { AnyObject, RouterOptions as _RouterOptions, Route as _Route } from '@ausginer/router';
import type { ActionValue } from '../types/general.js';
import type { Route } from '../types/Route.js';
import type { RouterOptions } from '../types/RouterOptions.js';
import * as impl2router from './impl2router.js';

export function options<R extends AnyObject, C extends AnyObject>({
  baseUrl,
  errorHandler,
}: RouterOptions<R, C> = {}): _RouterOptions<ActionValue, R, C> {
  const baseHref = document.head.querySelector('base')?.getAttribute('href');

  return {
    baseURL: baseUrl ?? baseHref ?? undefined,
    // @ts-expect-error: ignore "void" type here
    errorHandler: errorHandler ? (error, _) => errorHandler(error) : undefined,
  };
}

export function route<R extends AnyObject, C extends AnyObject>(route: Route<R, C>): _Route<ActionValue, R, C> {
  return {
    async action(context) {
      if (route.action) {
        return await route.action.call(route, impl2router.context(context));
      }
    },
    ...rest,
  } satisfies _Route<ActionValue, R, C>;
}

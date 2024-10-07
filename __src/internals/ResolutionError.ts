import type { AnyObject, EmptyObject } from '@ausginer/router';
import type { RouteContext } from '../types/RouteContext.js';

export class ResolutionError<R extends AnyObject = EmptyObject, C extends AnyObject = EmptyObject> extends Error {
  readonly code?: number;
  readonly context: RouteContext<R, C>;

  constructor(context: RouteContext<R, C>, options?: ResolutionErrorOptions) {
    let errorMessage = `Path '${context.pathname}' is not properly resolved due to an error.`;
    const routePath = getRoutePath(context.route);
    if (routePath) {
      errorMessage += ` Resolution had failed on route: '${routePath}'`;
    }
    super(errorMessage, options);
    this.code = options?.code;
    this.context = context;
  }

  warn(): void {
    console.warn(this.message);
  }
}

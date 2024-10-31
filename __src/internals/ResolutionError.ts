import type { EmptyObject } from '@ausginer/router';
import type { RouteContext } from '../types/RouteContext.js';

export interface ResolutionErrorOptions extends ErrorOptions {
  code?: number;
}

function* iterateChainUntilRoute<R extends object = EmptyObject, C extends object = EmptyObject>(
  context: RouteContext<R, C>,
) {
  for (const route of context.chain ?? []) {
    yield route.path;
    if (route === context.route) {
      break;
    }
  }
}

export class ResolutionError<R extends object = EmptyObject, C extends object = EmptyObject> extends Error {
  readonly code?: number;
  readonly context: RouteContext<R, C>;

  constructor(context: RouteContext<R, C>, options?: ResolutionErrorOptions) {
    let errorMessage = `Path '${context.pathname}' is not properly resolved due to an error.`;
    const routePath = [...iterateChainUntilRoute(context)].join('/');
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

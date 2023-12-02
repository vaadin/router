import { Router, type EmptyRecord, type Optional } from '@ausginer/router';
import type { ActionResult, Redirect, Route } from './utils.js';
import { convertRoute } from './utils.js';

export type Context = Readonly<{
  pathname: string;
}>;

export default class Resolver<
  T = unknown,
  R extends Record<string, unknown> = EmptyRecord,
  C extends Record<string, unknown> = EmptyRecord,
> {
  #router!: Router<ActionResult<T> | Redirect, R, C>;
  #routes!: ReadonlyArray<Route<T, R, C>>;

  constructor(routes: ReadonlyArray<Route<T, R, C>> | Route<T, R, C>) {
    this.setRoutes(Array.isArray(routes) ? routes : [routes]);
  }

  getRoutes(): ReadonlyArray<Route<T, R, C>> {
    return this.#routes;
  }

  setRoutes(value: ReadonlyArray<Route<T, R, C>>): void {
    this.#routes = value;
    this.#router = new Router(this.#routes.map(convertRoute));
  }

  removeRoutes(): void {
    this.#routes = [];
    this.#router = new Router<ActionResult<T> | Redirect, R, C>([]);
  }

  async resolve(path: URL | string, ...context: Optional<C>): Promise<unknown> {
    return await this.#router.resolve(path, ...context);
  }
}

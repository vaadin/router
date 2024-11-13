import '@helpers/iframe.script.js';
import { Router } from '@vaadin/router';
import './x-user-layout-d3.js';

// tag::snippet[]
export type RouteExtension = Readonly<{
  router: Router<RouteExtension>;
}>;

export const router = new Router<RouteExtension>(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', redirect: '/users/me', router },
  { path: '/users/:user', component: 'x-user-layout-d3', router },
]);

// end::snippet[]

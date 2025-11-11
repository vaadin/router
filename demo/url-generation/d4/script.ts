import '@helpers/iframe.script.js';
import { Router } from '@vaadin/router';
import './x-user-layout-d4.js';

history.pushState(null, '', '/ui/');

// tag::snippet[]
export type RouteExtension = Readonly<{
  router: Router<RouteExtension>;
}>;

export const router = new Router<RouteExtension>(document.getElementById('outlet'), { baseUrl: '/ui/' });
await router.setRoutes([
  { path: '/', redirect: '/users/me', router },
  { name: 'users', path: '/users/:user', component: 'x-user-layout-d4', router },
]);
// end::snippet[]

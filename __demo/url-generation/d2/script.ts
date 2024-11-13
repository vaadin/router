import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '@vaadin/router';
import './x-main-layout.js';

// tag::snippet[]
export type RouteExtension = Readonly<{
  router: Router<RouteExtension>;
}>;
export const router = new Router<RouteExtension>(document.getElementById('outlet'));
await router.setRoutes([
  {
    path: '/',
    component: 'x-main-layout',
    router,
    children: [
      { path: '/', component: 'x-home-view', router },
      { path: '/users', component: 'x-user-list', router },
      { path: '/users/:user', component: 'x-user-profile', router },
    ],
  },
]);
// end::snippet[]

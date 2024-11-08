import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '@vaadin/router';
import './x-main-layout.js';

// tag::snippet[]
export const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  {
    path: '/',
    component: 'x-main-layout',
    children: [
      { path: '/', component: 'x-home-view' },
      { path: '/users', component: 'x-user-list' },
      { path: '/users/:user', component: 'x-user-profile' },
    ],
  },
]);
// end::snippet[]

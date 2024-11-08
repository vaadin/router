import '@helpers/iframe.script.js';
import { Router } from '@vaadin/router';
import './x-user-layout.js';

// tag::snippet[]
export const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', redirect: '/users/me' },
  { path: '/users/:user', component: 'x-user-layout' },
]);

// end::snippet[]

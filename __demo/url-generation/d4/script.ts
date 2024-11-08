import '@helpers/iframe.script.js';
import { Router } from '@vaadin/router';
import './x-user-layout.js';

// tag::snippet[]
export const router = new Router(document.getElementById('outlet'), { baseUrl: '/ui/' });
await router.setRoutes([
  { path: '', redirect: 'users/me' },
  { name: 'users', path: 'users/:user', component: 'x-user-layout' },
]);
// end::snippet[]

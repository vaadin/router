import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-not-found-view.js';
import '@helpers/x-not-found-view.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/users', component: 'x-user-list' },
  { path: '/users/(.*)', component: 'x-user-not-found-view' },
  { path: '(.*)', component: 'x-not-found-view' },
]);
// end::snippet[]

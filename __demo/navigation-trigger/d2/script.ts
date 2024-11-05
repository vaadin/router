import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import { Router } from '../../../src/index.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/users', component: 'x-user-list' },
]);
// end::snippet[]

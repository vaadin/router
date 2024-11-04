import '@helpers/iframe.script.js';
import { Router } from '../../../src/index.js';
import './x-user-deleted.js';
import './x-user-manage.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', redirect: '/user/guest/manage' },
  { path: '/user/:user/manage', component: 'x-user-manage' },
  { path: '/user/delete', component: 'x-user-deleted' },
]);
// end::snippet[]

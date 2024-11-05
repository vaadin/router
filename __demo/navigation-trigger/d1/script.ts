import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import { Router } from '../../../src/index.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/users', component: 'x-user-list' },
]);

setInterval(() => {
  window.history.pushState(null, document.title, window.location.pathname !== '/' ? '/' : '/users');
  window.dispatchEvent(new PopStateEvent('popstate'));
}, 3000);
// end::snippet[]

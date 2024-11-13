import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-login-view.js';
import { Router } from '@vaadin/router';
import './x-admin-view.js';

// tag::snippet[]
window.authorized = false;

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/admin', component: 'x-admin-view' },
  { path: '/login/:to?', component: 'x-login-view' },
  {
    path: '/logout',
    action(_, commands) {
      window.authorized = false;
      return commands.redirect('/');
    },
  },
]);
// end::snippet[]

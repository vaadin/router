import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-profile.js';
import '@helpers/x-knowledge-base.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/u/:user', redirect: '/user/:user' },
  { path: '/user/:user', component: 'x-user-profile' },
  { path: '/data/:segments+/:path+', redirect: '/kb/:path+' },
  { path: '/kb/:path+', component: 'x-knowledge-base' },
]);
// end::snippet[]

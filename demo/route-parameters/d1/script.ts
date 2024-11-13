import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-profile.js';
import '@helpers/x-image-view.js';
import '@helpers/x-knowledge-base.js';
import '@helpers/x-profile-view.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/profile/:user', component: 'x-user-profile' },
  { path: '/image/:size/:color?', component: 'x-image-view' },
  { path: '/image-:size(\\d+)px', component: 'x-image-view' },
  { path: '/kb/:path*', component: 'x-knowledge-base' },
  { path: '/(user[s]?)/:id', component: 'x-profile-view' },
]);
// end::snippet[]

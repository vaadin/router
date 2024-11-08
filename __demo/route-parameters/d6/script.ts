import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-image-view.js';
import '@helpers/x-user-profile.js';
import '@helpers/x-profile-view.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/users', component: 'x-user-list' },
  { path: '/:user', component: 'x-user-profile' },
]);
// end::snippet[]

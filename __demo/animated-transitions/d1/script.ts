import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-image-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '../../../src/index.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  {
    path: '/',
    animate: true,
    children: [
      { path: '', component: 'x-home-view' },
      { path: '/image-:size(\\d+)px', component: 'x-image-view' },
      { path: '/users', component: 'x-user-list' },
      { path: '/users/:user', component: 'x-user-profile' },
    ],
  },
]);
// end::snippet[]

import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-image-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/users',
    async children() {
      return await import('@helpers/user-routes.js').then((mod) => mod.default);
    },
  },
]);
// end::snippet[]

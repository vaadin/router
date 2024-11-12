import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/users',
    children: [
      { path: '', component: 'x-user-list' },
      { path: '/:user', component: 'x-user-profile' },
    ],
  },
]);
router.unsubscribe();

// router will re-render only when the `render()` method is called explicitly:
await router.render('/users');
// end::snippet[]

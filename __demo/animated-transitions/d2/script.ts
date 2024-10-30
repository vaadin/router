import '@helpers/iframe.script.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '../../../src/index.js';
import './x-wrapper.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  {
    path: '/',
    component: 'x-wrapper',
    children: [
      {
        path: '/users',
        animate: {
          enter: 'users-entering',
          leave: 'users-leaving',
        },
        children: [
          { path: '', component: 'x-user-list' },
          {
            path: '/:user',
            component: 'x-user-profile',
            animate: true,
          },
        ],
      },
      { path: '(.*)', redirect: '/users' },
    ],
  },
]);
// end::snippet[]

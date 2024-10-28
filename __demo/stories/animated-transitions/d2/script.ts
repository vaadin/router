import { Router } from '../../../../src/index.js';
import '../../../display-components/x-user-list.js';
import '../../../display-components/x-user-profile.js';
import './x-wrapper.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  {
    path: '/',
    children: [
      {
        path: '/users',
        animate: {
          enter: 'users-entering',
          leave: 'users-leaving',
        },
        component: 'x-wrapper',
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

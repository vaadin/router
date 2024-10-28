import { Router } from '../../../../src/index.js';
import '../../../display-components/x-home-view.js';
import '../../../display-components/x-image-view.js';
import '../../../display-components/x-user-list.js';
import '../../../display-components/x-user-profile.js';

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

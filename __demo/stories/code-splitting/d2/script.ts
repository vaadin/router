import { Router } from '../../../../src/index.js';
import '@helpers/x-home-view.js';
import '@helpers/x-image-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/users',
    async children(){
      await import(`@helpers/users-routes.js`).then(({default}) => default),
    }
  },
]);
// end::snippet[]

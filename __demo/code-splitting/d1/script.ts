import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-image-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '../../../src/index.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/user/:id',
    action: async () => {
      await import(`@helpers/user.bundle.js`);
    },
    component: 'x-user-js-bundle-view', // <-- defined in the bundle
  },
]);
// end::snippet[]

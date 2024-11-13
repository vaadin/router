import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/user/:id',
    async action() {
      await import(`./user.bundle.js`);
    },
    component: 'x-user-js-bundle-view', // <-- defined in the bundle
  },
]);
// end::snippet[]

import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
async function pollBackendForChanges() {
  return await new Promise<void>((resolve) => {
    // this can be an async backend call
    setTimeout(() => resolve(), 1000);
  });
}

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/users',
    action: pollBackendForChanges, // will be triggered for all children
    children: [
      { path: '/', component: 'x-user-list' },
      { path: '/:user', component: 'x-user-profile' },
    ],
  },
]);
// end::snippet[]

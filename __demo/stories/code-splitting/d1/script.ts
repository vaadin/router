import { Router } from '../../../../src/index.js';
import init from '../../../common.script.js';
import '../../../display-components/x-home-view.js';
import '../../../display-components/x-image-view.js';
import '../../../display-components/x-user-list.js';
import '../../../display-components/x-user-profile.js';

init();

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/user/:id',
    action: async () => {
      await Vaadin.Demo.import(`${Vaadin.Demo.componentsRoot}/user.bundle.js`);
    },
    component: 'x-user-js-bundle-view', // <-- defined in the bundle
  },
]);
// end::snippet[]

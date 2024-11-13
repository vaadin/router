import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-profile.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
document.querySelector('#trigger')?.addEventListener('click', () => {
  Router.go('/user/you-know-who');
});

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/user/:user', component: 'x-user-profile' },
]);
// end::snippet[]

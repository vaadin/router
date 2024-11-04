import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import '@helpers/x-not-found-view.js';
import { Router } from '../../../src/index.js';

// tag::snippet[]
window.addEventListener('vaadin-router-location-changed', (event) => {
  const breadcrumbs = document.querySelector('#breadcrumbs')!;
  breadcrumbs.innerHTML = `You are at '${event.detail.location.pathname}'`;
});

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/users', component: 'x-user-list' },
  { path: '/users/:user', component: 'x-user-profile' },
  { path: '(.*)', component: 'x-not-found-view' },
]);
// end::snippet[]

import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import { Router } from '@vaadin/router';
import './x-project-view.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/(project[s]?)/:id', component: 'x-project-view' },
]);
// end::snippet[]

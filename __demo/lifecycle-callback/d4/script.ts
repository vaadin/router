import '@helpers/iframe.script.js';
import { Router } from '../../../src/index.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-main-page' },
  { path: '/edit', component: 'x-autosave-view' },
]);
// end::snippet[]

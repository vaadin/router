import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import { Router } from '../../../src/index.js';
import './x-friend.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/friend', component: 'x-friend' },
]);
// end::snippet[]

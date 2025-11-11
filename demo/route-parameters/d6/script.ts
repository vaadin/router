import '@helpers/iframe.script.js';
import './x-hash-view.js';
import { Router } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([{ path: '/', component: 'x-hash-view' }]);
// end::snippet[]

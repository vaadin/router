import '@helpers/iframe.script.js';
import { Router } from '@vaadin/router';
import './x-page-number-view.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([{ path: '/', component: 'x-page-number-view' }]);
// end::snippet[]

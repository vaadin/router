import '@helpers/iframe.script.js';
import { Router } from '@vaadin/router';
import './x-pages-menu.js';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([{ path: '/', component: 'x-pages-menu' }]);
// end::snippet[]

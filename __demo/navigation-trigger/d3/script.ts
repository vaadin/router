import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import { DEFAULT_TRIGGERS, Router } from '@vaadin/router';

// tag::snippet[]
const { POPSTATE } = DEFAULT_TRIGGERS;
Router.setTriggers(POPSTATE);

document.querySelector('ul')?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLLIElement && event.target.dataset.href) {
    window.history.pushState({}, '', event.target.dataset.href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
});

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/users', component: 'x-user-list' },
]);
// end::snippet[]

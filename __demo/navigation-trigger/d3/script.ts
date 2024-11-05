import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import { NavigationTriggers, Router } from '../../../src/index.js';
import './x-countdown.js';

// tag::snippet[]
const { POPSTATE } = DEFAULT_TRIGGERS;
Router.setTriggers(POPSTATE);

document.querySelector('ul')?.addEventListener('click', (event) => {
  const target = event.target;
  if (target.localName === 'li' && target.dataset.href) {
    window.history.pushState({}, null, target.dataset.href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
});

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  { path: '/users', component: 'x-user-list' },
]);
// end::snippet[]

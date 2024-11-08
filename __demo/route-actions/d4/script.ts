import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import { Router, type Commands, type RouteContext } from '@vaadin/router';

// tag::snippet[]
function render(context: RouteContext, commands: Commands) {
  if (context.params.user === 'admin') {
    return commands.component('x-user-profile');
  }
  const stubElement = commands.component('h3');
  stubElement.innerHTML = 'Access denied';
  return stubElement;
}

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  // current route parameters are automatically transferred to rendered element
  { path: '/users/:user', action: render },
]);
// end::snippet[]

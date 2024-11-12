import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-profile.js';
import { Router, type Commands, type RouteContext } from '@vaadin/router';

// tag::snippet[]
function redirect(context: RouteContext, commands: Commands) {
  (context.params.user as string) += ' (redirected)';
  return commands.redirect(`/users/:user`);
}

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  // current route parameters are automatically transferred to redirect target
  { path: '/employees/:user', action: redirect },
  { path: '/users/:user', component: 'x-user-profile' },
]);
// end::snippet[]

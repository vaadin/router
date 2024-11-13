import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-login-view.js';
import { Router, type Commands, type RouteContext } from '@vaadin/router';

// tag::snippet[]
const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  {
    path: '/',
    async action(context: RouteContext, commands: Commands) {
      // Extract the `?view=` parameter value and decide upon it
      const view = new URLSearchParams(context.search).get('view');
      if (view === 'login') {
        return commands.component('x-login-view');
      } else if (view) {
        // Redirect home for unkown values
        return commands.redirect('/');
      }

      // Skip to next route if parameter is absent
      return await context.next();
    },
  },
  // Same path, only matches if the action above skips
  { path: '/', component: 'x-home-view' },
]);
// end::snippet[]

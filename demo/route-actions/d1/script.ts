import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router, type RouteContext } from '@vaadin/router';

// tag::snippet[]
const urlToNumberOfVisits: Record<string, number | undefined> = {};

async function recordUrlVisit(context: RouteContext) {
  const visitedPath = context.pathname; // get current path
  urlToNumberOfVisits[visitedPath] = (urlToNumberOfVisits[visitedPath] ?? 0) + 1;
  document.getElementById('stats')!.textContent =
    `Statistics on URL visits: ${JSON.stringify(urlToNumberOfVisits, null, 2)}}`;
  return await context.next(); // pass to the next route in the list
}

const router = new Router(document.getElementById('outlet'));
await router.setRoutes([
  { path: '/', component: 'x-home-view' },
  {
    path: '/users',
    action: recordUrlVisit, // will be triggered for all children
    children: [
      { path: '/', component: 'x-user-list' },
      { path: '/:user', component: 'x-user-profile' },
    ],
  },
]);
// end::snippet[]

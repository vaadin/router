/* eslint-disable import/no-duplicates */
import '@helpers/iframe.script.js';
import '@helpers/x-home-view.js';
import '@helpers/x-image-view.js';
import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import { Router, type VaadinRouterLocationChangedEvent } from '../../../src/index.js';
import '@helpers/x-breadcrumbs.js';
import '@helpers/x-not-found-view.js';
import type { Breadcrumb } from '@helpers/x-breadcrumbs.js';

// tag::snippet[]
type RouteExtension = Readonly<{
  xBreadcrumb?: Breadcrumb;
}>;

window.addEventListener('vaadin-router-location-changed', (event: VaadinRouterLocationChangedEvent<RouteExtension>) => {
  const {
    router,
    location: { params },
  } = event.detail;

  const breadcrumbs = document.querySelector('x-breadcrumbs')!;
  breadcrumbs.items = router.location.routes
    .map((route) => route.xBreadcrumb)
    .filter((xBreadcrumb) => xBreadcrumb != null)
    .map(({ href, title }) => ({
      title: title.replace(/:user/u, params.user as string),
      href: href.replace(/:user/u, params.user as string),
    }));
});

const router = new Router<RouteExtension>(document.getElementById('outlet'));
await router.setRoutes([
  {
    path: '/',
    xBreadcrumb: { title: 'home', href: '/' },
    children: [
      { path: '/', component: 'x-home-view' },
      {
        path: '/users',
        xBreadcrumb: { title: 'users', href: '/users' },
        children: [
          { path: '/', component: 'x-user-list' },
          { path: '/:user', xBreadcrumb: { title: ':user', href: '/users/:user' }, component: 'x-user-profile' },
        ],
      },
    ],
  },
  { path: '(.*)', component: 'x-not-found-view' },
]);
// end::snippet[]

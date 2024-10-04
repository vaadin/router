// NOTE(platosha): This file is a test fixture for TypeScript declarations.
// Only the compilation success is tested. We don’t emit any JS from the
// code below and don't execute it.

/* eslint-disable */

import {
  Router,
  type NavigationTrigger,
  type Route,
  type Commands,
  type RouteContext,
  type RouterLocation,
  type WebComponentInterface,
  type PreventAndRedirectCommands,
  type PreventCommands,
  type EmptyCommands,
} from '../../src/index.js';
import { DEFAULT_TRIGGERS } from '../../src/triggers/navigation.js';

const outlet = document.body.firstChild as Element;

function expectTypeOfValue<T>(t: T): void {
  t;
}

// Instantiation styles
new Router().unsubscribe();

new Router(outlet).unsubscribe();
new Router(outlet, {}).unsubscribe();
new Router(outlet, { baseUrl: '/' }).unsubscribe();
new Router(null).unsubscribe();
new Router(null, {}).unsubscribe();
new Router(null, { baseUrl: '/' }).unsubscribe();
new Router(undefined).unsubscribe();
new Router(undefined, {}).unsubscribe();
new Router(undefined, { baseUrl: '/' }).unsubscribe();

const router = new Router(outlet, { baseUrl: '/' });

// Static methods
Router.setTriggers();
const { CLICK, POPSTATE } = DEFAULT_TRIGGERS;
Router.setTriggers(CLICK);
Router.setTriggers(POPSTATE);
Router.setTriggers(CLICK, POPSTATE);
const MyNavigationTrigger: NavigationTrigger = {
  activate() {},
  inactivate() {},
};
Router.setTriggers(CLICK, POPSTATE, MyNavigationTrigger);
Router.setTriggers({ activate() {}, inactivate() {} });
Router.setTriggers({ activate() {}, inactivate() {} }, { activate() {}, inactivate() {} });

// Basic properties
expectTypeOfValue<string>(router.baseUrl);
expectTypeOfValue<RouterLocation>(router.location);
expectTypeOfValue<string>(router.location.baseUrl);
expectTypeOfValue<object>(router.location.params);
expectTypeOfValue<string>(router.location.pathname);
expectTypeOfValue<Route | null>(router.location.route);
expectTypeOfValue<URLSearchParams>(router.location.searchParams);
expectTypeOfValue<readonly Route[]>(router.location.routes);
expectTypeOfValue<string>(router.location.getUrl());
expectTypeOfValue<string>(router.location.getUrl({}));
expectTypeOfValue<string>(router.location.getUrl([]));
expectTypeOfValue<Promise<RouterLocation>>(router.ready);

// Basic methods
router.render('/');
(): ReturnType<typeof router.render> extends Promise<Node> ? true : never => true;
router.subscribe();
router.unsubscribe();
expectTypeOfValue<string>(router.urlForName('foo'));
expectTypeOfValue<string>(router.urlForName('foo', null));
expectTypeOfValue<string>(router.urlForName('foo', { bar: 'yes' }));
expectTypeOfValue<string>(router.urlForName('foo', ['yes']));
expectTypeOfValue<string>(router.urlForPath('foo'));
expectTypeOfValue<string>(router.urlForPath('foo', null));
expectTypeOfValue<string>(router.urlForPath('foo', { bar: 'yes' }));
expectTypeOfValue<string>(router.urlForPath('foo', ['yes']));

// Empty routes
router.setRoutes([]);

// Standalone route
const r: Route = { path: '/standalone', component: 'x-standalone' };
r.redirect = '/x-standalone';
r.action = () => {};
router.setRoutes([r]);

// Action arguments
r.action = (context: RouteContext, commands: Commands) => {
  expectTypeOfValue<string>(context.pathname);
  expectTypeOfValue<string | undefined>(context.search);
  expectTypeOfValue<string | undefined>(context.hash);
  expectTypeOfValue<{} | string[]>(context.params);
  expectTypeOfValue<string | number | null | ReadonlyArray<string | number | null>>(context.params.foo);
  expectTypeOfValue<string | number | null | ReadonlyArray<string | number | null>>(context.params[0]);
  expectTypeOfValue<string>(context.route.path);

  if (context.pathname === '/next') {
    return context.next();
  } else if (context.pathname === '/home') {
    return commands.component('x-home');
  } else if (context.pathname === '/no-go') {
    return commands.prevent();
  }
  return commands.redirect('/');
};

// Standalone route
router.setRoutes([r]);

// Single non-wrapped in Array route
router.setRoutes({ path: '/', action() {} });

// Inline routes
router.setRoutes([
  { path: 'component', component: 'x-component' },
  { path: 'redirect', redirect: '/redirect' },
  { path: 'parent', name: 'with-children', children: [{ path: 'child', children: [] }] },
]);

// Various action return types
router.setRoutes([
  { path: 'action-nothing', action: () => {} },
  {
    path: 'action-component',
    action: () => document.createElement('x-foo'),
  },
  {
    path: 'action-commands-component',
    action: (_, commands: Commands) => commands.component('x-foo'),
  },
  {
    path: 'action-commands-prevent',
    action: (_, commands: Commands) => commands.prevent(),
  },
  {
    path: 'action-commands-redirect',
    action: (_, commands: Commands) => commands.redirect('/'),
  },
  {
    path: 'action-next',
    action: async (context) => await context.next(),
  },
  { path: 'async-action-nothing', action: async () => await Promise.resolve() },
  { path: 'async-action-null', action: async () => await Promise.resolve(null) },
  {
    path: 'async-action-component',
    action: async () => await Promise.resolve(document.createElement('x-foo')),
  },
  {
    path: 'async-action-commands-component',
    action: async (_, commands: Commands) => await Promise.resolve(commands.component('x-foo')),
  },
  {
    path: 'async-action-commands-prevent',
    action: async (_, commands: Commands) => await Promise.resolve(commands.prevent()),
  },
  {
    path: 'async-action-commands-redirect',
    action: async (_, commands: Commands) => await Promise.resolve(commands.redirect('/')),
  },
  {
    path: 'async-action-next',
    action: async (context) => await Promise.resolve(context.next()),
  },
]);

// setOutlet
router.setOutlet(outlet);
router.setOutlet(null);

// getOutlet
expectTypeOfValue<Element | DocumentFragment | null | undefined>(router.getOutlet());

// Location property
class MyViewWithLocation extends HTMLElement {
  location: RouterLocation = router.location;

  connectedCallback() {
    this.localName;
    this.location.pathname;
  }
}
customElements.define('my-view-with-location', MyViewWithLocation);

// Lifecycle

class MyViewWithBeforeEnter extends HTMLElement implements WebComponentInterface {
  onBeforeEnter(location: RouterLocation, commands: PreventAndRedirectCommands, router: Router) {
    this.localName;
    location.baseUrl;
    router.baseUrl;
    commands.prevent();
    if ('component' in commands) {
      throw new Error('unexpected');
    }
    return commands.redirect('/');
  }
}
customElements.define('my-view-with-before-enter', MyViewWithBeforeEnter);

class MyViewWithBeforeLeave extends HTMLElement implements WebComponentInterface {
  onBeforeLeave(location: RouterLocation, commands: PreventCommands, router: Router) {
    this.localName;
    location.baseUrl;
    router.baseUrl;
    if ('component' in commands || 'redirect' in commands) {
      throw new Error('unexpected');
    }
    return commands.prevent();
  }
}
customElements.define('my-view-with-before-leave', MyViewWithBeforeLeave);

class MyViewWithAfterEnter extends HTMLElement implements WebComponentInterface {
  onAfterEnter(location: RouterLocation, commands: EmptyCommands, router: Router) {
    this.localName;
    location.baseUrl;
    if ('component' in commands || 'redirect' in commands || 'prevent' in commands) {
      throw new Error('unexpected');
    }
    router.baseUrl;
  }
}
customElements.define('my-view-with-after-enter', MyViewWithAfterEnter);

class MyViewWithAfterLeave extends HTMLElement implements WebComponentInterface {
  onAfterLeave(location: RouterLocation, commands: EmptyCommands, router: Router) {
    this.localName;
    location.baseUrl;
    if ('component' in commands || 'redirect' in commands || 'prevent' in commands) {
      throw new Error('unexpected');
    }
    router.baseUrl;
  }
}
customElements.define('my-view-with-after-leave', MyViewWithAfterLeave);

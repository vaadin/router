// NOTE(platosha): This file is a test fixture for TypeScript declarations.
// Only the compilation success is tested. We don’t emit any JS from the
// code below and don't execute it.

import {Router} from '@vaadin/router';

const outlet: Node = document.body.firstChild as Node;

function expectTypeOfValue<T>(t: T): void { t; }

// Instantiation styles
new Router().unsubscribe();

new Router(outlet).unsubscribe();
new Router(outlet, {}).unsubscribe();
new Router(outlet, {baseUrl: '/'}).unsubscribe();
new Router(null).unsubscribe();
new Router(null, {}).unsubscribe();
new Router(null, {baseUrl: '/'}).unsubscribe();
new Router(undefined).unsubscribe();
new Router(undefined, {}).unsubscribe();
new Router(undefined, {baseUrl: '/'}).unsubscribe();

const router = new Router(outlet, {baseUrl: '/'});

// Static methods
Router.setTriggers();
// FIXME(platosha): declare Router.NavigationTrigger static builtin triggers
// Router.setTriggers(Router.NavigationTrigger.CLICK);
// Router.setTriggers(Router.NavigationTrigger.POPSTATE);
// Router.setTriggers(Router.NavigationTrigger.CLICK, Router.NavigationTrigger.POPSTATE);
Router.setTriggers({activate() {}, inactivate() {}});
Router.setTriggers(
  {activate() {}, inactivate() {}},
  {activate() {}, inactivate() {}}
);
expectTypeOfValue<boolean>(Router.go('/'));

// Basic properties
expectTypeOfValue<string>(router.baseUrl);
expectTypeOfValue<Router.Location>(router.location);
expectTypeOfValue<string>(router.location.baseUrl);
expectTypeOfValue<object>(router.location.params);
expectTypeOfValue<string>(router.location.pathname);
expectTypeOfValue<Router.Route | null>(router.location.route);
expectTypeOfValue<Router.Route[]>(router.location.routes);
expectTypeOfValue<string>(router.location.getUrl());
expectTypeOfValue<string>(router.location.getUrl({}));
expectTypeOfValue<string>(router.location.getUrl([]));
expectTypeOfValue<Promise<Router.Location>>(router.ready);

// Basic methods
router.render('/');
(): ReturnType<typeof router.render> extends Promise<Node> ? true : never => true;
router.subscribe();
router.unsubscribe();
expectTypeOfValue<string>(router.urlForName('foo'));
expectTypeOfValue<string>(router.urlForName('foo', null));
expectTypeOfValue<string>(router.urlForName('foo', {bar: 'yes'}));
expectTypeOfValue<string>(router.urlForName('foo', ['yes']));
expectTypeOfValue<string>(router.urlForPath('foo'));
expectTypeOfValue<string>(router.urlForPath('foo', null));
expectTypeOfValue<string>(router.urlForPath('foo', {bar: 'yes'}));
expectTypeOfValue<string>(router.urlForPath('foo', ['yes']));

// Empty routes
router.setRoutes([]);

// Standalone route
const r: Router.Route = {path: '/standalone'};
r.component = 'x-standalone';
r.redirect = '/x-standalone';
r.action = () => {};
router.setRoutes([r]);

// Action arguments
r.action = (context: Router.Context, commands: Router.Commands) => {
  expectTypeOfValue<string>(context.pathname);
  expectTypeOfValue<string>(context.search);
  expectTypeOfValue<string>(context.hash);
  expectTypeOfValue<object>(context.params);
  expectTypeOfValue<any>(context.params['foo']);
  expectTypeOfValue<any>(context.params[0]);
  expectTypeOfValue<string>(context.route.path);

  if (context.pathname === '/next') {
    return context.next();
  } else if (context.pathname === '/home') {
    return commands.component('x-home');
  } else if (context.pathname === '/no-go') {
    return commands.prevent();
  } else {
    return commands.redirect('/');
  }
};

// Standalone route
router.setRoutes([r]);

// Single non-wrapped in Array route
router.setRoutes({path: '/'});

// Inline routes
router.setRoutes([
  {path: 'component', component: 'x-component'},
  {path: 'redirect', redirect: '/redirect'},
  {path: 'parent', name: 'with-children', children: [
    {path: 'child', children: []},
  ]}
]);

// Various action return types
router.setRoutes([
  {path: 'action-nothing', action: () => {}},
  {path: 'action-null', action: () => null},
  {path: 'action-component', action: () => {
    return document.createElement('x-foo');
  }},
  {path: 'action-commands-component', action: (_, commands: Router.Commands) => {
    return commands.component('x-foo');
  }},
  {path: 'action-commands-prevent', action: (_, commands: Router.Commands) => {
    return commands.prevent();
  }},
  {path: 'action-commands-redirect', action: (_, commands: Router.Commands) => {
    return commands.redirect('/');
  }},
  {path: 'action-next', action: (context) => {
    return context.next();
  }},
  {path: 'async-action-nothing', action: () => Promise.resolve()},
  {path: 'async-action-null', action: () => Promise.resolve(null)},
  {path: 'async-action-component', action: () => {
    return Promise.resolve(document.createElement('x-foo'));
  } },
  {path: 'async-action-commands-component', action: (_, commands: Router.Commands) => {
    return Promise.resolve(commands.component('x-foo'));
  }},
  {path: 'async-action-commands-prevent', action: (_, commands: Router.Commands) => {
    return Promise.resolve(commands.prevent());
  }},
  {path: 'async-action-commands-redirect', action: (_, commands: Router.Commands) => {
    return Promise.resolve(commands.redirect('/'));
  }},
  {path: 'async-action-next', action: (context) => {
    return Promise.resolve(context.next());
  }}
]);

// setOutlet
router.setOutlet(outlet);
router.setOutlet(null);

// getOutlet
expectTypeOfValue<Node | null>(router.getOutlet());

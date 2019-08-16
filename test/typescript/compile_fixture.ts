// NOTE(platosha): This file is a test fixture for TypeScript declarations.
// Only the compilation success is tested. We don’t emit any JS from the
// code below and don't execute it.

import {Router} from '@vaadin/router';

const r: Router.Route = {
  path: '/standalone'
};
r.component = 'x-standalone';
r.redirect = '/x-standalone';

r.action = (context: Router.Context, commands: Router.Commands) => {
  if (context.pathname === '/') {
    const element = document.createElement('div');
    element.textContent = context.pathname + ' '
      + context.search + ' '
      + context.hash + ' '
      + context.params['foo'] + ' '
      + context.params[0] + ' '
      + context.route.path;
    return element;
  } else if (context.pathname === '/next') {
    return context.next();
  } else if (context.pathname === '/home') {
    return commands.component('x-home');
  } else if (context.pathname === '/no-go') {
    return commands.prevent();
  } else {
    return commands.redirect('/');
  }
};

const router = new Router(document.body, {
  baseUrl: '/'
});
router.setRoutes([
  {path: 'component', component: 'x-component'},
  {path: 'redirect', redirect: '/redirect'},
  {path: 'parent', name: 'with-children', children: [
    {path: 'child', children: []},
  ]},
  {path: 'action-nothing', action: () => {}},
  {path: 'action-null', action: () => null},
  {path: 'action-component', action: () => {
    return document.createElement('x-foo');
  }},
  {path: 'action-commands-component', action: (_, commands: Router.Commands) => {
    return commands.component('x-foo');
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
  {path: 'async-action-commands-redirect', action: (_, commands: Router.Commands) => {
    return Promise.resolve(commands.redirect('/'));
  }},
  {path: 'async-action-next', action: (context) => {
    return Promise.resolve(context.next());
  }}
]);

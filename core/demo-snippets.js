it('should have a good DX (v1)', () => {
  const router = new Vaadin.Router([
    {  path: '/', component: 'x-home-view' },
    {  path: '/users', component: 'x-user-list' }
  ]);

  window.addEventListener('popstate', async (event) => {
    const dom = await router.render(window.location.pathname);
    const outlet = document.getElementById('outlet');
    
    const children = outlet.children;
    if (children && children.length) {
      const parent = children[0].parentNode;
      for (let i = 0; i < children.length; i += 1) {
        parent.removeChild(children[i]);
      }
    }

    outlet.appendChild(dom);
  });
});

it('should have a good DX (v2)', () => {
  const routes = [
    {  path: '/', component: 'x-home-view' },
    {  path: '/users', component: 'x-user-list' }
  ];
  const outlet = document.getElementById('outlet');
  const router = new Vaadin.Router(routes, outlet);

  window.addEventListener('popstate', (event) => {
    router.render(window.location.pathname);
  });
});

it('should have a good DX (v3)', () => {
  const router = new Vaadin.Router([
    {  path: '/', component: 'x-home-view' },
    {  path: '/users', component: 'x-user-list' }
  ]);
  router.start({
    observe: ['popstate', 'click'], // default: ['popstate']
    outlet: document.getElementById('outlet'),
  });
});

it('should have a good DX (v4)', () => {
  const routes = [
    {  path: '/', action: component('x-home-view') },
    {  path: '/users', component: 'x-user-list' }
  ];

  const router = new Vaadin.Router(routes, document.getElementById('outlet'));
  router.start();

  const resolver = new Vaadin.RouteResolver(routes);
  const renderer = new Vaadin.RouteRenderer(resolver, document.getElementById('outlet'));
  Vaadin.Router.start();
  const router = new Vaadin.Router(renderer, )

  router.stop();

  const dom = await router.resolve(path);
  my_custom_render(dom);

  router.setOutlet({
    main: document.getElementById('outlet'),
    sidebar: document.getElementById('sidebar')
  });

  router.render(path);

  /* [routes] */ router.addRoutes(routeOrRoutes);
  /* [routes] */ router.removeRoutes(routeOrRoutes);
  /* [routes] */ router.getRoutes();
  /* [routes] */ router.setRoutes(routeOrRoutes);
  /* {options} */ router.getOptions();
  /* {options} */ router.setOptions(someOptions);
});































//--------------- option 1 ---------------
import {AppRouter, component, bundle} from '@vaadin/router';

const router = new AppRouter(document.body);
router.route('/', component('x-home-view'));
router.route('/users', bundle('src/users-bundle.html'))
  .children(parent => {
    parent.route('/', component('x-user-list'));
    parent.route('/:user', component(bundle('src/x-user-profile.html')))
  });
router.route('*', component('x-not-found-view'));
router.listen({popstate: true, click: true});
































//--------------- option 2 ---------------
import {AppRouter, component, bundle} from '@vaadin/router';

const router = new AppRouter(document.body);
router.setRoutes([
    { path: '/', action: component('x-home-view') },
    { path: '/users',
      action: bundle('bundles/users-bundle.html'),
      children: [
        { path: '/', action: component('x-user-list') },
        { path: '/:user', action: component(bundle('src/x-user-profile.html')) }
      ]
    },
    { path: '*', component: 'x-not-found-view' }
  ]);
router.listen({popstate: true, click: true});





























//--------------- option 3 ---------------
import {Router} from '@vaadin/router';

const router = new Router(document.body);
router.setRoutes([
    { path: '/', component: 'x-home-view' },
    { path: '/users',
      component: 'bundles/users-bundle.html',
      children: [
        { path: '/', component: 'x-user-list' },
        { path: '/:user', bundle: 'src/x-user-profile.html' }
      ]
    },
    { path: '*', component: 'x-not-found-view' }
  ]);
router.listen({popstate: true, click: false});


router.setRoutes([
  { path: '/about', redirect: '/company/about' },
  { path: '/company/about', component: 'x-about-view' },
]);





























//--------------- option 4 ---------------
import {RouteResolver} from '@vaadin/router';

const resolver = new RouteResolver([
    { path: '/', component: 'x-home-view' },
    { path: '/users',
      bundle: 'bundles/users-bundle.html',
      children: [
        { path: '/', component: 'x-user-list' },
        { path: '/:user', bundle: 'src/x-user-profile.html' }
      ]
    },
    { path: '*', component: 'x-not-found-view' }
  ], {
    resolveFn: (context) => {
      const route = context.route;
      if (typeof route.action === 'function') {
        return route.action(context);
      } else if (route.component || route.bundle) {
        return myCustomRouteResolveFn(context);
      }
    }
  });
window.addEventListener('popstate', async () => {
  const result = await resolver.resolve(window.location.pathname);
  myCustomRenderFunction(result);
});
























//--------------- option 5 ---------------
import {RouteResolver} from '@vaadin/router';

const resolver = new RouteResolver([
    { path: '/', component: 'x-home-view' },
    { path: '/users',
      bundle: 'bundles/users-bundle.html',
      children: [
        { path: '/', component: 'x-user-list' },
        { path: '/:user', bundle: 'src/x-user-profile.html' }
      ]
    },
    { path: '*', component: 'x-not-found-view' }
  ], {
    resolveFn: (context) => {
      const route = context.route;
      if (typeof route.action === 'function') {
        return route.action(context);
      } else if (route.component || route.bundle) {
        return myCustomRouteAction(context);
      }
    }
  });
window.addEventListener('popstate', async () => {
  const result = await resolver.resolve(window.location.pathname);
  myCustomRenderFunction(result);
})

function componentRouteAction(context) {
  const element = document.createElement(context.route.component);

  context.route.action = (context) => {
    for (const key of context.keys) {
      element[key] = context.params[key];
    }

    let result;
    if (typeof element.onBeforeEnter === 'function') {
      result = element.onBeforeEnter(context);
    }
    if (result === null || result === undefined) {
      return element;
    } else {
      return result;
    }
  }

  context.activate(context.route, (context) => {
    // on inactivate
    let result;
    if (typeof element.onBeforeLeave === 'function') {
      result = element.onBeforeLeave(context);
    }
    if (result === null || result === undefined) {
      delete this.route.action;
      element = null;
    } else {
      return result;
    }
  });

  return context.route.action(context);
}







//--------------- option 6 ---------------
import {Router} from '@vaadin/router';
import userRoutes from './routes/user.js';

const router = new Router(document.body);
router.setRoutes([
    { path: '/', component: 'x-home-view' },
    // ES 2018 syntax
    { path: '/users', ...userRoutes },
    // ES 2015 syntax
    Object.assign({ path: '/users' }, userRoutes),
    // explicit 'config' property
    { path: '/users', config: userRoutes },
    { path: '*', component: 'x-not-found-view' }
  ]);
router.listen({popstate: true, click: false});

//--
export default {
  bundle: 'src/x-user-bundle.html',
  component: 'x-user-layout',
  children: [
    { path: '/', component: 'x-user-home' },
    { path: '/:user', component: 'x-user-profile' },
  ]
};














































//--------------- option 7 ---------------
import {Router} from '@vaadin/router';

const router = new Router(document.body);
router.setRoutes([
    { path: '/', component: 'x-home-view' },
    { path: '/users', bundle: 'bundles/x-user-bundle.js' },
    { path: '*', component: 'x-not-found-view' }
  ]);
router.listen({popstate: true, click: false});

//-- bundles/x-user-bundle.js:
export function config(context) {
  return {
    component: 'x-user-layout',
    children: [
      { path: '/', component: 'x-user-home' },
      { path: '/:user', component: 'x-user-profile' },
    ]
  };
};






































//--------------- option 8 ---------------
import {Router, POPSTATE} from '@vaadin/router';

const router = new Router(document.body);
router.setRoutes([
    { path: '/', component: 'x-home-view' },
    { path: '/users', bundle: 'src/x-user-bundle.html' },
    { path: '*', component: 'x-not-found-view' }
  ]);
router.listen(POPSTATE);

function listen(...sources) {
  this.__navigationEventHandler = this.__onNavigationEvent.bind(this);
  sources.forEach(source => {
    source.addEventListener(this.__navigationEventHandler);
  });
}

//-- popstateEventSource.js
const listeners = [];
const popstateEventSource = {
  addEventListener(listener) {
    listeners.push(listener);
  },

  removeEventListener(listener) {
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }
};

window.addEventListener('popstate', (event) => {
  for (let index = listeners.length - 1; index >= 0; index -= 1) {
    listeners[i](event);
    if (event.defaultPrevented) {
      return;
    }
  }
});

export {popstateEventSource as POPSTATE};















//--------------- option 9 ---------------
const startMarker = document.createComment('vaadin-router-outlet start');
const endMarker = document.createComment('vaadin-router-outlet end');

outlet.insertBefore(endMarker, outlet.firstChild);
outlet.insertBefore(startMarker, outlet.firstChild);

const range = document.createRange();
range.setStartAfter(startMarker);
range.setEndBefore(endMarker);
range.deleteContents();


//----------------------
const startMarker = document.createComment('vaadin-router-outlet start');
const endMarker = document.createComment('vaadin-router-outlet end');

outlet.appendChild(startMarker);
outlet.appendChild(endMarker);

const range = document.createRange();
range.setStartAfter(startMarker);
range.setEndBefore(endMarker);
range.deleteContents();


//----------------------
const startMarker = document.createComment('vaadin-router-outlet start');
outlet.appendChild(startMarker);

const range = document.createRange();
range.selectNodeContents(outlet);
range.setStartAfter(startMarker);
range.deleteContents();
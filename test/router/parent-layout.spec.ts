import { expect } from "@esm-bundle/chai";
import sinon from "sinon";
import { Router } from "../../src/router.js";
import {
  checkOutletContents,
  cleanup,
  onAfterEnterAction,
  onBeforeEnterAction, onBeforeLeaveAction,
  verifyActiveRoutes
} from "./test-utils.js";

describe('Router', function() {
  // eslint-disable-next-line no-invalid-this
  const suite = this;
  suite.title = suite.title + (window.ShadyDOM ? ' (Shady DOM)' : '');

  const DEFAULT_URL = location.href;

  let outlet: HTMLElement;
  let router: Router;

  before(() => {
    outlet = document.createElement('div');
    document.body.append(outlet);
  });

  after(() => {
    outlet.remove();
  });

  beforeEach(async function () {
    // reset the window URL
    window.history.pushState(null, '', location.origin);
    // create a new router instance
    router = new Router(outlet);
  });

  afterEach(() => {
    router.unsubscribe();
    cleanup(outlet);
    history.pushState(null, '', DEFAULT_URL);
  });

  describe('parent layouts rendering', () => {
    const checkOutlet = values => checkOutletContents(outlet.lastChild, 'tagName', values);

    it('each of the nested route components are rendered as children to each other in the same hierarchy', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b', children: [
                {path: '/c', component: 'x-c'}
              ]}
          ]},
      ]);

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('should preserve references to same DOM node and reuse it on subsequent renders', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b'},
            {path: '/c', component: 'x-c'},
            {path: '/d', component: 'x-d'}
          ]}
      ]);

      await router.render('/a/b');
      const first = outlet.lastChild;
      expect(first.firstElementChild.tagName).to.match(/x-b/i);

      await router.render('/a/c');
      const second = outlet.lastChild;
      expect(second).to.equal(first);
      expect(second.firstElementChild.tagName).to.match(/x-c/i);

      await router.render('/a/d');
      const third = outlet.lastChild;
      expect(third).to.equal(second);
      expect(third.firstElementChild.tagName).to.match(/x-d/i);
    });

    it('should update parent location when reusing layout', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b'},
            {path: '/c', component: 'x-c'},
            {path: '/([de])', component: 'x-d'}
          ]}
      ]);

      await router.render('/a/b');
      expect(outlet.lastElementChild.location.pathname).to.equal('/a/b');

      await router.render('/a/c');
      expect(outlet.lastElementChild.location.pathname).to.equal('/a/c');

      await router.render('/a/d');
      expect(outlet.lastElementChild.location.pathname).to.equal('/a/d');

      await router.render('/a/e');
      expect(outlet.lastElementChild.location.pathname).to.equal('/a/e');
    });

    it('should remove nested route components when the parent route is navigated to', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b'}
          ]},
        {path: '/c', component: 'x-c'}
      ]);

      await router.render('/a/b');
      await router.render('/c');
      await router.render('/a');

      verifyActiveRoutes(router, ['/a']);
      checkOutlet(['x-a']);
    });

    it('when action returns a component result, it is rendered the same way as if it was a component property', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', action: (context, commands) => commands.component('x-b'), children: [
                {path: '/c', action: (context, commands) => commands.component('x-c')}
              ]}
          ]},
      ]);

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('extra child view in route chain is not rendered, if path does not match', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b', children: [
                {path: '/c', component: 'x-c', children: [
                    {path: '/d', component: 'x-d'}
                  ]}
              ]}
          ]}
      ]);

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('should not render the root component, if path does not match', async() => {
      router.setRoutes([
        {path: '/', component: 'x-root', children: [
            {path: '/a', component: 'x-a'}
          ]}
      ]);
      let exception;
      await router.render('/c').catch((e) => {
        exception = e;
      });
      expect(exception, 'No exception thrown for not matched route /c').to.be.instanceof(Error);
    });

    it('should allow parent route paths with trailing slashes', async() => {
      router.setRoutes([
        {path: '/', component: 'x-root'},
        {path: '/a/', component: 'x-a', children: [
            {path: '/b', component: 'x-b'},
            {path: '(.+)', component: 'x-any'},
          ]},
      ]);

      await router.render('/');
      checkOutlet(['x-root']);

      await router.render('/a/');
      checkOutlet(['x-a']);

      await router.render('/a/b');
      checkOutlet(['x-a', 'x-b']);
    });

    it('when not all nested views have components, all present components are rendered as children ' +
      'to each other in the same hierarchy', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', children: [
                {path: '/c', children: [
                    {path: '/d', component: 'x-d'}
                  ]}
              ]}
          ]},
      ]);

      await router.render('/a/b/c/d');

      verifyActiveRoutes(router, ['/a', '/b', '/c', '/d']);
      checkOutlet(['x-a', 'x-d']);
    });

    it('should take next routes as fallback when children do not match', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b'}
          ]},
        {path: '/a/c', component: 'x-fallback'}
      ], true);

      await router.render('/a/c');

      verifyActiveRoutes(router, ['/a/c']);
      checkOutlet(['x-fallback']);
    });

    it('should take next routes as fallback when grandchildren do not match', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b', children: [
                {path: '/b', component: 'x-c'}
              ]},
          ]},
        {path: '/a/b/d', component: 'x-fallback'}
      ], true);

      await router.render('/a/b/d');

      verifyActiveRoutes(router, ['/a/b/d']);
      checkOutlet(['x-fallback']);
    });

    it('should throw not found when neither children nor siblings match', async() => {
      // Ensure outlet is clean
      const childNodes = Array.from(outlet.childNodes);
      while (outlet.childNodes.length) {
        outlet.removeChild(outlet.lastChild);
      }

      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b', children: [
                {path: '/b', component: 'x-c'}
              ]},
          ]},
        {path: '/a/b/d', component: 'x-fallback'}
      ], true);

      const onError = sinon.spy();
      await router.render('/a/b/e').catch(onError);

      expect(outlet.childNodes.length).to.equal(0);
      const error = onError.args[0][0];
      expect(error).to.be.an('error');
      expect(error.message).to.match(/page not found/i);

      // Restore previous outlet content
      while (outlet.childNodes.length) {
        outlet.removeChild(outlet.lastChild);
      }
      childNodes.forEach(childNode => outlet.appendChild(childNode));
    });

    it('should render the matching child route even if it is not under the first matching parent', async() => {
      router.setRoutes([
        {
          path: '/',
          component: 'x-layout-a',
          children: [
            {path: '/a', component: 'x-a'},
          ]
        },
        {
          path: '/',
          component: 'x-layout-b',
          children: [
            {path: '/b', component: 'x-b'}
          ]
        },
      ]);

      await router.render('/b');

      verifyActiveRoutes(router, ['/', '/b']);
      checkOutlet(['x-layout-b', 'x-b']);
    });

    it('redirect property amends previous path', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b', children: [
                {path: '/c', component: 'x-c', redirect: '/d'}
              ]}
          ]},
        {path: '/d', component: 'x-d', children: [
            {path: '/e', component: 'x-e'}
          ]}
      ]);

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/d']);
      checkOutlet(['x-d']);
    });

    it('action with redirect result amends previous path', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {
              path: '/b',
              action: (context, commands) => commands.redirect('/d/e'),
              component: 'x-b',
              children: [
                {path: '/c', component: 'x-c'}
              ]
            }
          ]},
        {path: '/d', component: 'x-d', children: [
            {path: '/e', component: 'x-e'}
          ]}
      ]);

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/d', '/e']);
      checkOutlet(['x-d', 'x-e']);
    });

    it('child layout: onAfterEnter should receive correct route parameters', async() => {
      const onAfterEnter = sinon.spy();
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b/:id', action: onAfterEnterAction('x-b', onAfterEnter)}
          ]}
      ]);

      await router.render('/a/b/123');

      expect(onAfterEnter).to.have.been.calledOnce;
      expect(onAfterEnter.args[0].length).to.equal(3);

      const location = onAfterEnter.args[0][0];
      expect(location.pathname).to.equal('/a/b/123');
      expect(location.route.path).to.equal('/b/:id');
      expect(location.params).to.have.property('id', '123');

      verifyActiveRoutes(router, ['/a', '/b/:id']);
      checkOutlet(['x-a', 'x-b']);
    });

    it('child layout: onBeforeEnter with redirect result amends previous path', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', action: onBeforeEnterAction('x-b', (location, commands) => commands.redirect('/d/e')), children: [
                {path: '/c', component: 'x-c'}
              ]}
          ]},
        {path: '/d', component: 'x-d', children: [
            {path: '/e', component: 'x-e'}
          ]}
      ]);

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/d', '/e']);
      checkOutlet(['x-d', 'x-e']);
    });

    it('child layout: onBeforeEnter with cancel result aborts current resolution', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', component: 'x-b', children: [
                {path: '/c', component: 'x-c'}
              ]}
          ]},
        {path: '/d', action: onBeforeEnterAction('x-d', (location, commands) => commands.prevent()), children: [
            {path: '/e', component: 'x-e'}
          ]}
      ]);

      await router.render('/a/b/c');
      await router.render('/d/e');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('child layout: onBeforeLeave with cancel result aborts current resolution', async() => {
      router.setRoutes([
        {path: '/a', component: 'x-a', children: [
            {path: '/b', action: onBeforeLeaveAction('x-b', (location, commands) => commands.prevent()), children: [
                {path: '/c', component: 'x-c'}
              ]}
          ]},
        {path: '/d', component: 'x-d', children: [
            {path: '/e', component: 'x-e'}
          ]}
      ]);

      await router.render('/a/b/c');
      await router.render('/d/e');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });
  });
});

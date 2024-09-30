import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { Router } from '../../src/router.js';
import type { ResolutionError, RouterLocation } from '../../src/types.js';
import '../setup.js';
import {
  checkOutletContents,
  cleanup,
  onAfterEnterAction,
  onBeforeEnterAction,
  onBeforeLeaveAction,
  verifyActiveRoutes,
} from './test-utils.js';

describe('Router', () => {
  let outlet: HTMLElement;
  let router: Router;

  before(() => {
    outlet = document.createElement('div');
    document.body.append(outlet);
  });

  after(() => {
    outlet.remove();
  });

  beforeEach(() => {
    // create a new router instance
    router = new Router(outlet);
  });

  afterEach(() => {
    router.unsubscribe();
    cleanup(outlet);
  });

  describe('parent layouts rendering', () => {
    const checkOutlet = (values: readonly string[]) =>
      checkOutletContents(outlet.lastChild as Element, 'tagName', values);

    it('each of the nested route components are rendered as children to each other in the same hierarchy', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [{ path: '/b', component: 'x-b', children: [{ path: '/c', component: 'x-c' }] }],
          },
        ],
        true,
      );

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('should preserve references to same DOM node and reuse it on subsequent renders', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [
              { path: '/b', component: 'x-b' },
              { path: '/c', component: 'x-c' },
              { path: '/d', component: 'x-d' },
            ],
          },
        ],
        true,
      );

      await router.render('/a/b');
      const first = outlet.lastChild;
      expect(first).to.have.deep.property('firstElementChild.tagName').that.matches(/x-b/iu);

      await router.render('/a/c');
      const second = outlet.lastChild;
      expect(second).to.equal(first);
      expect(second).to.have.deep.property('firstElementChild.tagName').that.matches(/x-c/iu);

      await router.render('/a/d');
      const third = outlet.lastChild;
      expect(third).to.equal(second);
      expect(third).to.have.deep.property('firstElementChild.tagName').that.matches(/x-d/iu);
    });

    it('should update parent location when reusing layout', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [
              { path: '/b', component: 'x-b' },
              { path: '/c', component: 'x-c' },
              { path: '/([de])', component: 'x-d' },
            ],
          },
        ],
        true,
      );

      await router.render('/a/b');
      expect(outlet.lastElementChild).to.have.deep.property('location.pathname').that.equals('/a/b');

      await router.render('/a/c');
      expect(outlet.lastElementChild).to.have.deep.property('location.pathname').that.equals('/a/c');

      await router.render('/a/d');
      expect(outlet.lastElementChild).to.have.deep.property('location.pathname').that.equals('/a/d');

      await router.render('/a/e');
      expect(outlet.lastElementChild).to.have.deep.property('location.pathname').that.equals('/a/e');
    });

    it('should remove nested route components when the parent route is navigated to', async () => {
      await router.setRoutes(
        [
          { path: '/a', component: 'x-a', children: [{ path: '/b', component: 'x-b' }] },
          { path: '/c', component: 'x-c' },
        ],
        true,
      );

      await router.render('/a/b');
      await router.render('/c');
      await router.render('/a');

      verifyActiveRoutes(router, ['/a']);
      checkOutlet(['x-a']);
    });

    it('when action returns a component result, it is rendered the same way as if it was a component property', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [
              {
                path: '/b',
                action: (_context, commands) => commands?.component('x-b'),
                children: [{ path: '/c', action: (_context, commands) => commands?.component('x-c') }],
              },
            ],
          },
        ],
        true,
      );

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('extra child view in route chain is not rendered, if path does not match', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [
              {
                path: '/b',
                component: 'x-b',
                children: [{ path: '/c', component: 'x-c', children: [{ path: '/d', component: 'x-d' }] }],
              },
            ],
          },
        ],
        true,
      );

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('should not render the root component, if path does not match', async () => {
      await router.setRoutes([{ path: '/', component: 'x-root', children: [{ path: '/a', component: 'x-a' }] }], true);
      let exception;
      await router.render('/c').catch((e: unknown) => {
        exception = e;
      });
      expect(exception, 'No exception thrown for not matched route /c').to.be.instanceof(Error);
    });

    it('should allow parent route paths with trailing slashes', async () => {
      await router.setRoutes(
        [
          { path: '/', component: 'x-root' },
          {
            path: '/a/',
            component: 'x-a',
            children: [
              { path: '/b', component: 'x-b' },
              { path: '(.+)', component: 'x-any' },
            ],
          },
        ],
        true,
      );

      await router.render('/');
      checkOutlet(['x-root']);

      await router.render('/a/');
      checkOutlet(['x-a']);

      await router.render('/a/b');
      checkOutlet(['x-a', 'x-b']);
    });

    it(
      'when not all nested views have components, all present components are rendered as children ' +
        'to each other in the same hierarchy',
      async () => {
        await router.setRoutes(
          [
            {
              path: '/a',
              component: 'x-a',
              children: [{ path: '/b', children: [{ path: '/c', children: [{ path: '/d', component: 'x-d' }] }] }],
            },
          ],
          true,
        );

        await router.render('/a/b/c/d');

        verifyActiveRoutes(router, ['/a', '/b', '/c', '/d']);
        checkOutlet(['x-a', 'x-d']);
      },
    );

    it('should take next routes as fallback when children do not match', async () => {
      await router.setRoutes(
        [
          { path: '/a', component: 'x-a', children: [{ path: '/b', component: 'x-b' }] },
          { path: '/a/c', component: 'x-fallback' },
        ],
        true,
      );

      await router.render('/a/c');

      verifyActiveRoutes(router, ['/a/c']);
      checkOutlet(['x-fallback']);
    });

    it('should take next routes as fallback when grandchildren do not match', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [{ path: '/b', component: 'x-b', children: [{ path: '/b', component: 'x-c' }] }],
          },
          { path: '/a/b/d', component: 'x-fallback' },
        ],
        true,
      );

      await router.render('/a/b/d');

      verifyActiveRoutes(router, ['/a/b/d']);
      checkOutlet(['x-fallback']);
    });

    it('should throw not found when neither children nor siblings match', async () => {
      // Ensure outlet is clean
      const childNodes = Array.from(outlet.childNodes);
      while (outlet.lastChild != null) {
        outlet.removeChild(outlet.lastChild);
      }

      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [{ path: '/b', component: 'x-b', children: [{ path: '/b', component: 'x-c' }] }],
          },
          { path: '/a/b/d', component: 'x-fallback' },
        ],
        true,
      );

      const onError = sinon.spy((_: unknown) => {});
      await router.render('/a/b/e').catch(onError);

      expect(outlet.childNodes.length).to.equal(0);
      const error: ResolutionError = onError.firstCall.firstArg;
      expect(error).to.be.an('error');
      expect(error.message).to.match(/page not found/iu);

      // Restore previous outlet content
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (outlet.lastChild != null) {
        outlet.removeChild(outlet.lastChild);
      }
      childNodes.forEach((childNode) => outlet.appendChild(childNode));
    });

    it('should render the matching child route even if it is not under the first matching parent', async () => {
      await router.setRoutes(
        [
          {
            path: '/',
            component: 'x-layout-a',
            children: [{ path: '/a', component: 'x-a' }],
          },
          {
            path: '/',
            component: 'x-layout-b',
            children: [{ path: '/b', component: 'x-b' }],
          },
        ],
        true,
      );

      await router.render('/b');

      verifyActiveRoutes(router, ['/', '/b']);
      checkOutlet(['x-layout-b', 'x-b']);
    });

    it('redirect property amends previous path', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [{ path: '/b', component: 'x-b', children: [{ path: '/c', component: 'x-c', redirect: '/d' }] }],
          },
          { path: '/d', component: 'x-d', children: [{ path: '/e', component: 'x-e' }] },
        ],
        true,
      );

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/d']);
      checkOutlet(['x-d']);
    });

    it('action with redirect result amends previous path', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [
              {
                path: '/b',
                action: (_context, commands) => commands?.redirect('/d/e'),
                component: 'x-b',
                children: [{ path: '/c', component: 'x-c' }],
              },
            ],
          },
          { path: '/d', component: 'x-d', children: [{ path: '/e', component: 'x-e' }] },
        ],
        true,
      );

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/d', '/e']);
      checkOutlet(['x-d', 'x-e']);
    });

    it('child layout: onAfterEnter should receive correct route parameters', async () => {
      const onAfterEnter = sinon.spy();
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [{ path: '/b/:id', action: onAfterEnterAction('x-b', onAfterEnter) }],
          },
        ],
        true,
      );

      await router.render('/a/b/123');

      expect(onAfterEnter).to.have.been.calledOnce;
      expect(onAfterEnter.args[0].length).to.equal(3);

      const location: RouterLocation = onAfterEnter.firstCall.firstArg;
      expect(location.pathname).to.equal('/a/b/123');
      expect(location.route?.path).to.equal('/b/:id');
      expect(location.params).to.have.property('id', '123');

      verifyActiveRoutes(router, ['/a', '/b/:id']);
      checkOutlet(['x-a', 'x-b']);
    });

    it('child layout: onBeforeEnter with redirect result amends previous path', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [
              {
                path: '/b',
                action: onBeforeEnterAction('x-b', (_location, commands) => commands.redirect('/d/e')),
                children: [{ path: '/c', component: 'x-c' }],
              },
            ],
          },
          { path: '/d', component: 'x-d', children: [{ path: '/e', component: 'x-e' }] },
        ],
        true,
      );

      await router.render('/a/b/c');

      verifyActiveRoutes(router, ['/d', '/e']);
      checkOutlet(['x-d', 'x-e']);
    });

    it('child layout: onBeforeEnter with cancel result aborts current resolution', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [{ path: '/b', component: 'x-b', children: [{ path: '/c', component: 'x-c' }] }],
          },
          {
            path: '/d',
            action: onBeforeEnterAction('x-d', (_location, commands) => commands.prevent()),
            children: [{ path: '/e', component: 'x-e' }],
          },
        ],
        true,
      );

      await router.render('/a/b/c');
      await router.render('/d/e');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });

    it('child layout: onBeforeLeave with cancel result aborts current resolution', async () => {
      await router.setRoutes(
        [
          {
            path: '/a',
            component: 'x-a',
            children: [
              {
                path: '/b',
                action: onBeforeLeaveAction('x-b', (_location, commands) => commands.prevent()),
                children: [{ path: '/c', component: 'x-c' }],
              },
            ],
          },
          { path: '/d', component: 'x-d', children: [{ path: '/e', component: 'x-e' }] },
        ],
        true,
      );

      await router.render('/a/b/c');
      await router.render('/d/e');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
      checkOutlet(['x-a', 'x-b', 'x-c']);
    });
  });
});

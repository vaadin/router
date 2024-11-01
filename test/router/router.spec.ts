import { expect, use } from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  NotFoundError,
  Router,
  type Commands,
  type Route,
  type RouteContext,
  type WebComponentInterface,
} from '../../__src/index.js';
import '../setup.js';
import { checkOutletContents, cleanup, onBeforeEnterAction } from './test-utils.js';

use(sinonChai);
use(chaiAsPromised);

async function expectException(callback: Promise<unknown>, expectedContentsArray?: readonly string[]) {
  let exceptionThrown = false;
  try {
    await callback;
  } catch (e: unknown) {
    exceptionThrown = true;
    if (expectedContentsArray?.length) {
      const exceptionString = e instanceof Error ? e.message : JSON.stringify(e);
      for (const expectedContent of expectedContentsArray) {
        expect(exceptionString).to.contain(expectedContent);
      }
    }
  }
  expect(exceptionThrown).to.equal(true);
}

describe('Router', () => {
  let outlet: HTMLElement;
  let link: HTMLAnchorElement;

  const checkOutlet = (values: readonly string[]) => checkOutletContents(outlet.children[0], 'tagName', values);

  before(() => {
    link = document.createElement('a');
    link.href = '/admin';
    link.id = 'admin-anchor';
    outlet = document.createElement('div');
    document.body.append(link, outlet);
    history.pushState(null, '', '/');
  });

  beforeEach(() => {
    history.replaceState(null, '', '/');
  });

  after(() => {
    outlet.remove();
    history.back();
  });

  afterEach(() => {
    cleanup(outlet);
  });

  describe('JS API (basic functionality)', () => {
    let router: Router;

    afterEach(() => {
      router.unsubscribe();
    });

    describe('new Router(outlet?, options?)', () => {
      it('should work without arguments', () => {
        router = new Router();
        expect(router).to.be.ok;
      });

      it('should accept a router outlet DOM Node as the 1st argument', () => {
        router = new Router(outlet);
        const actual = router.getOutlet();
        expect(actual).to.equal(outlet);
      });

      it('should throw if the router outlet is truthy but is not valid a DOM Node', () => {
        [true, 42, '<slot></slot>', {}, [document.body], () => document.body].forEach((arg) => {
          // @ts-expect-error: testing invalid arguments
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
          expect(() => new Router(arg), `${arg}`).to.throw(TypeError);
        });
      });

      it('route should throw when created with only path property', async () => {
        router = new Router(outlet);
        // @ts-expect-error route is missing required properties, expecting runtime error
        await expect(router.setRoutes([{ path: '/' }], true)).to.be.rejectedWith(Error, / either/iu);
      });

      it('should not fail silently if not configured (both routes and outlet missing)', async () => {
        router = new Router();
        link.click();
        await expect(router.ready).to.be.rejectedWith(NotFoundError, link.href);
      });

      it('should not fail silently if not configured (outlet is set but routes are missing)', async () => {
        router = new Router(outlet);
        link.click();
        await expect(router.ready).to.be.rejectedWith(NotFoundError, link.href);
      });
    });

    describe('baseUrl', () => {
      const baseElement = document.createElement('base');

      beforeEach(() => {
        baseElement.removeAttribute('href');
        document.head.appendChild(baseElement);
      });

      afterEach(() => {
        document.head.removeChild(baseElement);
      });

      it('should accept baseUrl in options object as the 2nd argument', () => {
        router = new Router(null, { baseUrl: '/users/' });
        expect(router)
          .to.have.property('baseUrl')
          .that.instanceOf(URL)
          .and.deep.includes(new URL('/users/', document.URL));
      });

      it('should use <base href> as default baseUrl', () => {
        baseElement.setAttribute('href', '/foo/');

        router = new Router(null);
        expect(router).to.have.property('baseUrl').that.deep.includes(new URL('/foo/', location.origin));
      });

      it('should resolve relative base href when setting baseUrl', () => {
        baseElement.setAttribute('href', './foo/../bar/asdf');

        router = new Router(null);
        expect(router).to.have.property('baseUrl').that.deep.includes(new URL('/bar/', location.origin));
      });

      it('should use absolute base href when setting baseUrl', () => {
        baseElement.setAttribute('href', '/my/base/');

        router = new Router(null);
        expect(router).to.have.property('baseUrl').that.deep.includes(new URL('/my/base/', location.origin));
      });

      it('should use custom base href when setting baseUrl', () => {
        baseElement.setAttribute('href', 'http://localhost:8080/my/custom/base/');

        router = new Router(null);
        expect(router).to.have.property('baseUrl').that.deep.includes(new URL('http://localhost:8080/my/custom/base/'));
      });

      it('should use baseUrl when matching relative routes', async () => {
        router = new Router(outlet, { baseUrl: '/foo/' });
        await router.setRoutes([{ path: 'home', component: 'x-home-view' }], true);
        await router.render('/foo/home');
        checkOutlet(['x-home-view']);
      });

      it('should use baseUrl when matching absolute routes', async () => {
        router = new Router(outlet, { baseUrl: '/foo/' });
        await router.setRoutes([{ path: '/home', component: 'x-home-view' }], true);

        await router.render('/foo/home');
        checkOutlet(['x-home-view']);
      });

      it('should not throw when base path starts with double slash', async () => {
        baseElement.setAttribute('href', `${location.origin}//foo`);

        router = new Router(outlet);
        expect(router).to.have.property('baseUrl').that.deep.includes(new URL('/foo', location.origin));

        await router.setRoutes([{ path: '(.*)', component: 'x-home-view' }], true);

        await router.render('//');
        checkOutlet(['x-home-view']);
      });
    });

    describe('router.render(pathname)', () => {
      const add100msDelay = async () =>
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 100);
        });

      beforeEach(() => {
        router = new Router(outlet);
      });

      it('should set a correct location to history when receiving a string path', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        await router.render('/', true);
        expect(window.location.pathname).to.be.equal('/');
        expect(window.location.search).to.be.equal('');
        expect(window.location.hash).to.be.equal('');
      });

      it('should throw if the router outlet is a not valid DOM Node (on finish)', async () => {
        await Promise.all(
          [undefined, null, 0, false, '', NaN].map(async (invalidOutlet) => {
            const _router = new Router(outlet);
            await _router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
            const fulfilled: sinon.SinonSpy<unknown[], void> = sinon.spy();
            const rejected: sinon.SinonSpy<unknown[], void> = sinon.spy();
            const ready = _router.render('/').then(fulfilled).catch(rejected);
            // @ts-expect-error: testing invalid arguments
            _router.outlet = invalidOutlet;
            await ready;
            expect(fulfilled).to.not.have.been.called;
            expect(rejected).to.have.been.calledOnce;
            expect(rejected.args[0][0]).to.be.instanceof(TypeError);
            _router.unsubscribe();
          }),
        );
      });

      it('should return a promise that resolves to the router.location', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        const result = router.render('/');
        expect(result).to.be.a('promise');
        const actual = await result;
        expect(actual).to.equal(router.location);
      });

      it('should not set the String.search function to location when router.render(string)', async () => {
        await router.setRoutes([{ path: '/foo', component: 'x-home-view' }], true);
        await router.render('/foo');

        expect(router.location.search).to.equal('');

        expect(router.location.pathname).to.equal('/foo');
        expect(router.location.hash).to.equal('');
      });

      it('should return a promise that resolves when the rendered content is appended to the DOM', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        const promise = router.render('/');
        expect(outlet.children).to.have.lengthOf(0);
        await promise;
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should return a promise that gets rejected on no-match', (done) => {
        const result = router.render('/path/not/defined');
        result
          .then(() => {
            throw new Error('the promise should have been rejected');
          })
          .catch(() => done());
      });

      it('should create and append a route `component` into the router outlet', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        await router.render('/');
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should rethrow DOMException if the route `component` is not a valid tag name', async () => {
        await router.setRoutes([{ path: '/', component: 'src/x-home-view' }], true);
        const fulfilled: sinon.SinonSpy<unknown[], void> = sinon.spy();
        const rejected: sinon.SinonSpy<unknown[], void> = sinon.spy();
        const ready = router.render('/').then(fulfilled).catch(rejected);
        await ready;
        expect(fulfilled).to.not.have.been.called;
        expect(rejected).to.have.been.calledOnce;
        expect(rejected.args[0][0]).to.be.instanceof(DOMException);
      });

      it('should replace any pre-existing content of the router outlet', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );
        await router.render('/');
        await router.render('/users');
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-users-view/iu);
      });

      it('should remove any pre-existing content of the router outlet on no-match', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        await router.render('/');

        await router.render('/path/not/defined').catch(() => {});
        expect(outlet.children).to.have.lengthOf(0);
      });

      it('should ignore a successful result of a resolve pass if a new resolve pass is started before the first is completed', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/slow', action: add100msDelay, children: [{ path: '/users', component: 'x-users-view' }] },
            { path: '/admin', component: 'x-admin-view' },
          ],
          true,
        );
        await Promise.all([
          router.render('/slow/users'), // start the first resolve pass
          router.render('/admin'), // start the second resolve pass before the first is completed
        ]);
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-admin-view/iu);
      });

      it('should ignore an error result of a resolve pass if a new resolve pass is started before the first is completed', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/slow', action: add100msDelay, children: [{ path: '/users', component: 'x-users-view' }] },
            { path: '/admin', component: 'x-admin-view' },
          ],
          true,
        );
        await Promise.all([
          router.render('/slow/non-existent').catch(() => {}), // start the first resolve pass
          router.render('/admin'), // start the second resolve pass before the first is completed
        ]);
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-admin-view/iu);
      });

      it('should start a new resolve pass when route has "redirect" property', async () => {
        const from = '/people';
        const pathname = '/users';
        const result = { redirect: { pathname, from, params: {} } };

        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/people', redirect: '/users' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );
        const spy = sinon.spy(router, 'resolve');
        await router.render(from);

        expect(spy).to.be.calledTwice;
        const firstResult = await spy.firstCall.returnValue;
        expect(firstResult).to.have.property('result').that.deep.equals(result);

        const secondArg = spy.secondCall.args[0] as RouteContext;

        expect(secondArg.redirectFrom).to.equal(from);
        expect(secondArg.pathname).to.equal(pathname);
      });

      it('should handle multiple redirects', async () => {
        await router.setRoutes(
          [
            { path: '/a', redirect: '/b' },
            { path: '/b', redirect: '/c' },
            { path: '/c', component: 'x-home-view' },
          ],
          true,
        );

        await router.render('/a');

        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should fail on recursive redirects', async () => {
        await router.setRoutes(
          [
            { path: '/a', redirect: '/b' },
            { path: '/b', redirect: '/c' },
            { path: '/c', redirect: '/a' },
          ],
          true,
        );

        const onError = sinon.stub<[unknown], undefined>();
        await router.render('/a').catch(onError);

        expect(outlet.children).to.have.lengthOf(0);
        expect(onError).to.have.been.calledOnce;
      });

      it('should render a component for the new route when redirecting', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/people', redirect: '/users' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );
        await router.render('/people');
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-users-view/iu);
      });

      it('should use `window.replaceState()` when redirecting on initial render', async () => {
        const pushSpy = sinon.spy(window.history, 'pushState');
        const replaceSpy = sinon.spy(window.history, 'replaceState');

        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/people', redirect: '/users' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );
        await router.render('/people', true);

        expect(pushSpy).to.not.be.called;
        expect(replaceSpy).to.be.calledOnce;

        pushSpy.restore();
        replaceSpy.restore();
      });

      it('should use `history.pushState()` when redirecting on next renders', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/people', redirect: '/users' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );
        await router.render('/', true);

        const pushSpy = sinon.spy(window.history, 'pushState');
        const replaceSpy = sinon.spy(window.history, 'replaceState');

        await router.render('/people', true);

        expect(pushSpy).to.be.calledOnce;
        expect(replaceSpy).to.not.be.called;

        // If we render '/people' again right away, it redirects back to current URL.
        // The URL does not change in that case, and history is not updated.
        // Make non-redirecting render to update the URL.
        await router.render('/', true);

        expect(pushSpy).to.be.calledTwice;
        expect(replaceSpy).to.not.be.called;

        // Redirecting navigation again
        await router.render('/people', true);

        expect(pushSpy).to.be.calledThrice;
        expect(replaceSpy).to.not.be.called;

        pushSpy.restore();
        replaceSpy.restore();
      });

      it('should set the `location.redirectFrom` property on the route component in case of redirect', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/people', redirect: '/users' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );
        await router.render('/people');
        expect(outlet.children[0]).to.have.nested.property('location.redirectFrom', '/people');
      });
    });

    describe('router.ready', () => {
      beforeEach(() => {
        router = new Router(outlet);
      });

      it('should be a promise', () => {
        expect(router).to.have.property('ready').that.is.a('promise');
      });

      it('(render in progress / ok) should get fulfilled after the render is completed', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        // eslint-disable-next-line no-void
        void router.render('/');
        await router.ready.then((_location) => {
          expect(outlet.children).to.have.lengthOf(1);
          expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
        });
      });

      it('(render in progress / error) should get rejected with the current render error', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        // eslint-disable-next-line no-void
        void router.render('non-existent-path');
        await router.ready
          .then(() => {
            throw new Error('the `ready` promise should have been rejected');
          })
          .catch((error: unknown) => {
            expect(outlet.children).to.have.lengthOf(0);
            expect(error).to.be.an('error');
            expect(error).to.have.property('code', 404);
            expect(error)
              .to.have.property('message')
              .that.matches(/non-existent-path/u);
          });
      });

      it('(render completed / ok) should get fulfilled with the last render result', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        await router.render('/').then(
          async () =>
            await router.ready.then(() => {
              expect(outlet.children).to.have.lengthOf(1);
              expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
            }),
        );
      });

      it('(render completed / error) should get rejected with the last render error', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        await router.render('non-existent-path').catch(
          async () =>
            await router.ready
              .then(() => {
                throw new Error('the `ready` promise should have been rejected');
              })
              .catch((error: unknown) => {
                expect(error).to.be.an('error');
                expect(error).to.have.property('code', 404);
                expect(error)
                  .to.have.property('message')
                  .that.matches(/non-existent-path/u);
              }),
        );
      });

      it('(no renders yet) should get fulfilled before the first render completes', async () => {
        const sequence: string[] = [];
        const p1 = router.ready.then(() => {
          expect(outlet.children).to.have.lengthOf(0);
          sequence.push('no render yet');
        });

        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        const p2 = router.render('/').then(() => {
          expect(outlet.children).to.have.lengthOf(1);
          sequence.push('first render done');
        });

        await Promise.all([p1, p2]).then(() => {
          expect(sequence[0]).to.equal('no render yet');
          expect(sequence[1]).to.equal('first render done');
        });
      });
    });

    describe('router.location', () => {
      beforeEach(() => {
        router = new Router(outlet);
      });

      it('should be a non-null object', () => {
        expect(router).to.have.property('location').that.is.an('object').and.is.not.null;
      });

      it('should initially have non-null pathname, routes and params properties', () => {
        expect(router.location).to.have.property('pathname').that.is.a('string');
        expect(router.location).to.have.property('routes').that.is.deep.equal([]);
        expect(router.location).to.have.property('params').that.is.deep.equal({});
      });

      it('should contain the baseUrl property', async () => {
        router.unsubscribe();
        router = new Router(outlet, { baseUrl: '/foo/' });

        await router.setRoutes([{ path: '', component: 'x-root' }], true);

        await router.render('/foo/');

        expect(router.location.baseUrl).to.equal('/foo/');
      });

      it('should contain the pathname from the last completed render pass', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-root' },
            { path: '/a/b/c', component: 'x-a' },
          ],
          true,
        );

        await router.render('/');
        await router.render('/a/b/c');

        expect(router.location.pathname).to.equal('/a/b/c');
      });

      it('should contain the pathname from the last completed render pass (with params)', async () => {
        await router.setRoutes([{ path: '/a/b/:c', component: 'x-a' }], true);

        await router.render('/a/b/42');

        expect(router.location.pathname).to.equal('/a/b/42');
      });

      it('should contain the final and the original pathnames from the last completed render pass (redirected)', async () => {
        await router.setRoutes(
          [
            { path: '/a', redirect: '/c' },
            { path: '/c', component: 'x-a' },
          ],
          true,
        );

        await router.render('/a');

        expect(router.location.pathname).to.equal('/c');
        expect(router.location.redirectFrom).to.equal('/a');
      });

      it('should contain the pathname after a failed render', async () => {
        await router.setRoutes([{ path: '/a', component: 'x-a' }], true);

        await router.render('/a');
        await router.render('/non-existent-path').catch(() => {});

        expect(router.location.pathname).to.equal('/non-existent-path');
      });

      it('should contain the routes chain from the last completed render pass (single route)', async () => {
        const route = { path: '/', component: 'x-home-view' };
        await router.setRoutes(route);

        await router.ready;

        expect(router.location.routes).to.have.lengthOf(1);
        expect(router.location.routes[0]).to.equal(route);
      });

      it('should contain the routes chain from the last completed render pass (multiple routes)', async () => {
        const routeC = { path: '/c', component: 'x-c' };
        const routeB = { path: '/b', component: 'x-b', children: [routeC] };
        const routeA = { path: '/a', component: 'x-a', children: [routeB] };

        await router.setRoutes(routeA, true);
        await router.render('/a/b/c');

        expect(router.location.routes).to.have.lengthOf(3);
        expect(router.location.routes[0]).to.equal(routeA);
        expect(router.location.routes[1]).to.equal(routeB);
        expect(router.location.routes[2]).to.equal(routeC);
      });

      it('should contain an empty routes chain array after a failed render', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }], true);
        await router.render('/');
        await router.render('/non-existent').catch(() => {});

        expect(router.location.routes).to.deep.equal([]);
      });

      it('should have a separate property for the last route of the routes chain', async () => {
        const routeC = { path: '/c', component: 'x-c' };
        const routeB = { path: '/b', component: 'x-b', children: [routeC] };
        const routeA = { path: '/a', component: 'x-a', children: [routeB] };

        await router.setRoutes(routeA, true);
        await router.render('/a/b/c');

        expect(router.location.route).to.equal(routeC);
      });

      it('should have a `null` route property after a failed render', async () => {
        const routeC = { path: '/c', component: 'x-c' };
        const routeB = { path: '/b', component: 'x-b', children: [routeC] };
        const routeA = { path: '/a', component: 'x-a', children: [routeB] };

        await router.setRoutes(routeA, true);
        await router.render('/a/b/c');
        await router.render('/non-existent').catch(() => {});

        expect(router.location.route).to.be.null;
      });

      it('should contain the parameters from the last completed render pass', async () => {
        await router.setRoutes(
          [
            { path: '/a/:b', component: 'x-a' },
            { path: '/:a/:b', component: 'x-any' },
          ],
          true,
        );

        await router.render('/any/thing');
        await router.render('/a/42');

        expect(router.location.params).to.deep.equal({ b: '42' });
      });

      it('should contain the parameters from the last completed render pass (redirected)', async () => {
        await router.setRoutes(
          [
            { path: '/a/:id', redirect: '/b/:id' },
            { path: '/b/:id', component: 'x-b' },
          ],
          true,
        );

        await router.render('/a/42');

        expect(router.location.params).to.deep.equal({ id: '42' });
      });

      it('should contain an empty parameters set after a failed render', async () => {
        await router.setRoutes([{ path: '/a/:id', component: 'x-a' }], true);

        await router.render('/a/42');
        await router.render('/non-existent-path').catch(() => {});

        expect(router.location.params).to.deep.equal({});
      });

      it('should update on router before component is connected', async () => {
        customElements.define(
          'x-connected-location-test',
          class extends HTMLElement implements WebComponentInterface {
            connectedCallback() {
              expect((this as WebComponentInterface).location?.getUrl()).to.equal('/x-connected-location-test');
              expect(router.location.getUrl()).to.equal('/x-connected-location-test');
            }
          },
        );
        await router.setRoutes([{ path: '/x-connected-location-test', component: 'x-connected-location-test' }], true);
        await router.render('/x-connected-location-test');
      });

      describe('getUrl() method', () => {
        it('should exist', () => {
          expect(router.location).to.have.property('getUrl').which.is.a('function');
        });

        it('should return current location url with empty arguments', async () => {
          await router.setRoutes([{ path: '/a/:id', component: 'x-a' }], true);

          await router.render('/a/42');

          expect(router.location.getUrl()).to.equal('/a/42');
        });

        it('should substitute in route path when given parameters', async () => {
          await router.setRoutes([{ path: '/a/:id', component: 'x-a' }], true);

          await router.render('/a/42');

          expect(router.location.getUrl({ id: 'foo' })).to.equal('/a/foo');
        });

        it('should ignore unknown parameters', async () => {
          await router.setRoutes([{ path: '/a/:id', component: 'x-a' }], true);

          await router.render('/a/42');

          expect(router.location.getUrl({ foo: 'bar' })).to.equal('/a/42');
        });

        it('should prepend baseUrl', async () => {
          router = new Router(null, { baseUrl: '/base/' });
          await router.setRoutes(
            [
              { path: '/a', component: 'x-a' },
              { path: 'b', component: 'x-b' },
            ],
            true,
          );

          await router.render('/base/a');
          expect(router.location.getUrl()).to.equal('/base/a');

          await router.render('/base/b');
          expect(router.location.getUrl()).to.equal('/base/b');
        });

        it('should work in onBeforeEnter lifecycle method', async () => {
          const callback = sinon.spy(() => {
            expect(() => {
              router.location.getUrl();
            }).to.not.throw();
          });
          await router.setRoutes([
            {
              path: '/',
              action: onBeforeEnterAction('x-foo', callback),
            },
          ]);
          await router.ready;
          expect(callback).to.have.been.calledOnce;
        });

        // cannot mock the call to `compile()` from the 'pathToRegexp' package
        xit('should invoke pathToRegexp', async () => {
          await router.setRoutes([{ path: '/a/:id', component: 'x-a' }], true);

          await router.render('/a/42');

          // @ts-ignore pathToRegexp is not exposed on the Router namespace anymore
          const compile = sinon.spy(Router.pathToRegexp, 'compile');
          try {
            router.location.getUrl({ id: 'foo' });
            expect(compile).to.be.calledWith('/a/:id');
          } finally {
            // @ts-ignore pathToRegexp is not exposed on the Router namespace anymore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            Router.pathToRegexp.compile.restore();
          }
        });
      });
    });

    describe('first render', () => {
      const onVaadinRouterGo = sinon.stub();

      before(() => {
        window.addEventListener('vaadin-router-go', onVaadinRouterGo);
      });

      afterEach(() => {
        onVaadinRouterGo.resetHistory();
      });

      after(() => {
        window.removeEventListener('vaadin-router-go', onVaadinRouterGo);
      });

      it('should preserve pathname, search and hash', async () => {
        window.history.replaceState(null, '', '/admin?a=b#hash');
        router = new Router(outlet);
        // eslint-disable-next-line no-void
        void router.setRoutes([
          { path: '/', component: 'x-home-view' },
          { path: '/admin', component: 'x-admin-view' },
        ]);
        await router.ready;
        // There should be no 'go' event yet.
        // The first navigation is called in `setRoutes()`
        expect(onVaadinRouterGo).not.to.be.called;
        expect(window.location.pathname).to.equal('/admin');
        expect(window.location.search).to.equal('?a=b');
        expect(window.location.hash).to.equal('#hash');

        expect(router.location.pathname).to.equal('/admin');
        expect(router.location.search).to.equal('?a=b');
        expect(router.location.searchParams.get('a')).to.equal('b');
        expect(router.location.hash).to.equal('#hash');
      });

      it('should preserve pathname and search', async () => {
        window.history.replaceState(null, '', '/admin?a=b');
        router = new Router(outlet);
        // eslint-disable-next-line no-void
        void router.setRoutes([
          { path: '/', component: 'x-home-view' },
          { path: '/admin', component: 'x-admin-view' },
        ]);
        await router.ready;
        expect(onVaadinRouterGo).not.to.be.called;
        expect(window.location.pathname).to.equal('/admin');
        expect(window.location.search).to.equal('?a=b');
        expect(window.location.hash).to.equal('');
      });

      it('should preserve pathname', async () => {
        window.history.replaceState(null, '', '/admin');
        router = new Router(outlet);
        // eslint-disable-next-line no-void
        void router.setRoutes([
          { path: '/', component: 'x-home-view' },
          { path: '/admin', component: 'x-admin-view' },
        ]);
        await router.ready;
        expect(onVaadinRouterGo).not.to.be.called;
        expect(window.location.pathname).to.equal('/admin');
        expect(window.location.search).to.equal('');
        expect(window.location.hash).to.equal('');

        expect(router.location.pathname).to.equal('/admin');
        expect(router.location.search).to.equal('');
        expect(router.location.searchParams.values().next().done).to.be.true;
        expect(router.location.hash).to.equal('');
      });
    });

    describe('navigation events', () => {
      beforeEach(async () => {
        router = new Router(outlet);
        // configure router and let it render '/'
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/admin', component: 'x-admin-view' },
          ],
          true,
        );
      });

      it('should update the history state after navigation', async () => {
        window.dispatchEvent(new CustomEvent('vaadin-router-go', { detail: { pathname: '/admin' } }));
        await router.ready;
        expect(window.location.pathname).to.equal('/admin');
      });

      it('should trigger a popstate event after navigation', async () => {
        const onpopstate = sinon.stub();
        window.addEventListener('popstate', onpopstate);
        window.dispatchEvent(new CustomEvent('vaadin-router-go', { detail: { pathname: '/admin' } }));
        await router.ready;
        window.removeEventListener('popstate', onpopstate);
        expect(onpopstate).to.have.been.calledOnce;
      });

      it('should not trigger a popstate event after navigation if the pathname has not changed', async () => {
        const onpopstate = sinon.stub();
        window.addEventListener('popstate', onpopstate);
        window.dispatchEvent(new CustomEvent('vaadin-router-go', { detail: { pathname: '/' } }));
        await router.ready;
        window.removeEventListener('popstate', onpopstate);
        expect(onpopstate).to.not.have.been.called;
      });

      it('should fire navigate event only once per single pathname change', async () => {
        const navigateSpy = sinon.stub();
        window.addEventListener('vaadin-router-go', navigateSpy);
        const event = new CustomEvent('vaadin-router-go', { detail: { pathname: '/admin' } });
        window.dispatchEvent(event);
        await router.ready;
        expect(navigateSpy).to.be.calledOnce;
      });

      it('should automatically subscribe to navigation events when created', async () => {
        window.dispatchEvent(new CustomEvent('vaadin-router-go', { detail: { pathname: '/' } }));
        await router.ready;
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should unsubscribe from navigation events after an `unsubscribe()` method call', async () => {
        window.dispatchEvent(new CustomEvent('vaadin-router-go', { detail: { pathname: '/' } }));
        await router.ready;
        router.unsubscribe();
        window.dispatchEvent(new CustomEvent('vaadin-router-go', { detail: { pathname: '/admin' } }));
        await router.ready;
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should subscribe to navigation events after a `subscribe()` method call', async () => {
        router.unsubscribe();
        router.subscribe();
        window.dispatchEvent(new CustomEvent('vaadin-router-go', { detail: { pathname: '/' } }));
        await router.ready;
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should handle updates to the routes config as navigation triggers', async () => {
        await router.setRoutes([{ path: '/', component: 'x-home-view' }]);
        await router.ready;
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should use the POPSTATE navigation trigger by default', async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
        await router.ready;
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should use the CLICK navigation trigger by default', async () => {
        link.click();
        await router.ready;
        expect(outlet.children).to.have.lengthOf(1);
        expect(outlet.children[0].tagName).to.match(/x-admin-view/iu);
      });

      it('should respect search detail property of `vaadin-router-go` event', async () => {
        window.dispatchEvent(
          new CustomEvent('vaadin-router-go', {
            detail: {
              pathname: '/admin',
              search: '?search',
            },
          }),
        );
        await router.ready;
        expect(window.location.search).to.equal('?search');
      });

      it('should respect hash detail property of `vaadin-router-go` event', async () => {
        window.dispatchEvent(
          new CustomEvent('vaadin-router-go', {
            detail: {
              pathname: '/admin',
              hash: '#hash',
            },
          }),
        );
        await router.ready;
        expect(window.location.hash).to.equal('#hash');
      });

      describe('Router.go() static method for navigation', () => {
        afterEach(async () => {
          await router.ready;
        });

        it('should be exposed', async () => {
          Router.go('/admin');
          await router.ready;
          expect(outlet.children).to.have.lengthOf(1);
          expect(outlet.children[0].tagName).to.match(/x-admin-view/iu);
        });

        it('should trigger a `vaadin-router-go` event on the `window`', () => {
          const spy = sinon.stub();
          window.addEventListener('vaadin-router-go', spy);
          Router.go('/');
          window.removeEventListener('vaadin-router-go', spy);
          expect(spy).to.have.been.calledOnce;
          expect(spy.args[0][0]).to.have.property('type', 'vaadin-router-go');
        });

        it('should pass the given pathname in the `detail.pathname` property of the triggered event when Router.go() is called', () => {
          const spy = sinon.stub();
          window.addEventListener('vaadin-router-go', spy);
          // use a valid route
          Router.go('/admin');
          window.removeEventListener('vaadin-router-go', spy);
          expect(spy).to.have.been.calledOnce;
          expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/admin');
        });

        it('should support url with search string', () => {
          const spy = sinon.stub();
          window.addEventListener('vaadin-router-go', spy);
          Router.go('/admin?foo=bar');
          window.removeEventListener('vaadin-router-go', spy);

          expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/admin');
          expect(spy.args[0][0]).to.have.nested.property('detail.search', '?foo=bar');
          expect(spy.args[0][0]).to.have.nested.property('detail.hash', '');
        });

        it('should support url with hash string', () => {
          const spy = sinon.stub();
          window.addEventListener('vaadin-router-go', spy);
          // use a valid route
          Router.go('/admin#foo');
          window.removeEventListener('vaadin-router-go', spy);

          expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/admin');
          expect(spy.args[0][0]).to.have.nested.property('detail.search', '');
          expect(spy.args[0][0]).to.have.nested.property('detail.hash', '#foo');
        });

        it('should support url with search and hash strings', () => {
          const spy = sinon.stub();
          window.addEventListener('vaadin-router-go', spy);
          // use a valid route
          Router.go('/admin?foo=bar#baz');
          window.removeEventListener('vaadin-router-go', spy);

          expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/admin');
          expect(spy.args[0][0]).to.have.nested.property('detail.search', '?foo=bar');
          expect(spy.args[0][0]).to.have.nested.property('detail.hash', '#baz');
        });

        it('should support object argument with pathname, optional search, and optional hash', () => {
          const spy = sinon.stub();
          window.addEventListener('vaadin-router-go', spy);

          Router.go(new URL('/admin', location.origin));

          expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/admin');
          expect(spy.args[0][0]).to.have.nested.property('detail.search', undefined);
          expect(spy.args[0][0]).to.have.nested.property('detail.hash', undefined);

          spy.resetHistory();
          Router.go(new URL('/admin?foo=bar', location.origin));

          expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/admin');
          expect(spy.args[0][0]).to.have.nested.property('detail.search', '?foo=bar');
          expect(spy.args[0][0]).to.have.nested.property('detail.hash', undefined);

          spy.resetHistory();
          Router.go(new URL('/admin?#baz', location.origin));

          expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/admin');
          expect(spy.args[0][0]).to.have.nested.property('detail.search', undefined);
          expect(spy.args[0][0]).to.have.nested.property('detail.hash', '#baz');

          window.removeEventListener('vaadin-router-go', spy);
        });

        it('should return false by default', () => {
          router.unsubscribe();

          const navigated = Router.go('/a');
          expect(navigated).to.equal(false);

          router.subscribe();
        });

        it('should return true if `vaadin-router-go` default is prevented', () => {
          router.unsubscribe();

          const eventPreventDefault = (e: Event) => e.preventDefault();
          window.addEventListener('vaadin-router-go', eventPreventDefault);

          const navigated = Router.go('/a');
          expect(navigated).to.equal(true);

          window.removeEventListener('vaadin-router-go', eventPreventDefault);
          router.subscribe();
        });
      });

      describe('default action', () => {
        it('should be prevented from router by default', () => {
          expect(
            !window.dispatchEvent(
              new CustomEvent('vaadin-router-go', {
                cancelable: true,
                // use a valid route
                detail: { pathname: '/admin' },
              }),
            ),
          ).to.be.true;
        });

        it('should not be prevented when no router is subscribed', () => {
          router.unsubscribe();

          expect(
            !window.dispatchEvent(
              new CustomEvent('vaadin-router-go', {
                cancelable: true,
                detail: { pathname: '/a' },
              }),
            ),
          ).to.be.false;

          router.subscribe();
        });

        it('should be prevented for pathnames matching baseUrl', () => {
          router = new Router(null, { baseUrl: '/app/' });
          expect(
            !window.dispatchEvent(
              new CustomEvent('vaadin-router-go', {
                cancelable: true,
                detail: { pathname: '/app/admin' },
              }),
            ),
          ).to.be.true;
        });

        it('should not be prevented for pathnames not matching baseUrl', () => {
          router = new Router(null, { baseUrl: '/app/' });
          expect(
            !window.dispatchEvent(
              new CustomEvent('vaadin-router-go', {
                cancelable: true,
                detail: { pathname: '/other-app/home' },
              }),
            ),
          ).to.be.false;
        });
      });
    });

    describe('route parameters', () => {
      beforeEach(() => {
        router = new Router(outlet);
      });

      it('should bind named parameters to `location.params` property using string keys', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/:user', component: 'x-user-profile' },
          ],
          true,
        );
        // eslint-disable-next-line no-void
        void router.render('/foo');
        await router.ready.then(() => {
          const elem = outlet.children[0] as WebComponentInterface;
          expect(elem.location).to.be.an('object');
          expect(elem.location?.params).to.be.an('object');
          expect(elem.location?.params.user).to.equal('foo');
        });
      });

      it('should bind unnamed parameters to `location.params` property using numeric indexes', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/(user[s]?)/:id', component: 'x-users-view' },
          ],
          true,
        );
        // eslint-disable-next-line no-void
        void router.render('/users/1');
        await router.ready.then(() => {
          const elem = outlet.children[0] as WebComponentInterface;
          expect(elem.location).to.be.an('object');
          expect(elem.location?.params).to.be.an('object');
          expect(elem.location?.params[0]).to.equal('users');
        });
      });

      it('should bind named custom parameters to `location.params` property using string keys', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/image-:size(\\d+)px', component: 'x-image-view' },
          ],
          true,
        );
        // eslint-disable-next-line no-void
        void router.render('/image-15px');
        await router.ready.then(() => {
          const elem = outlet.children[0] as WebComponentInterface;
          expect(elem.location).to.be.an('object');
          expect(elem.location?.params).to.be.an('object');
          expect(elem.location?.params.size).to.equal('15');
        });
      });

      it('should bind named segments to the `location.params` property using string keys', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/kb/:path+/:id', component: 'x-knowledge-base' },
          ],
          true,
        );
        // eslint-disable-next-line no-void
        void router.render('/kb/folder/nested/1');
        await router.ready.then(() => {
          const elem = outlet.children[0] as WebComponentInterface;
          expect(elem.location).to.be.an('object');
          expect(elem.location?.params).to.be.an('object');
          expect(elem.location?.params.path).to.deep.equal(['folder', 'nested']);
          expect(elem.location?.params.id).to.equal('1');
        });
      });

      it('should set the `location.pathname` property on the route component', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/admin', component: 'x-admin-view' },
            { path: '(.*)', component: 'x-not-found-view' },
          ],
          true,
        );
        await router.render('/non-existent/path');
        expect(outlet.children[0]).to.have.nested.property('location.pathname', '/non-existent/path');
      });

      it('should set the `location` properties on the route component', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/admin', component: 'x-admin-view' },
            { path: '(.*)', component: 'x-not-found-view' },
          ],
          true,
        );
        await router.render({
          pathname: '/non-existent/path',
          search: '?foo=bar',
          hash: '#baz',
        });
        expect(outlet.children[0]).to.have.nested.property('location.pathname', '/non-existent/path');
        expect(outlet.children[0]).to.have.nested.property('location.search', '?foo=bar');
        expect(outlet.children[0]).to.have.nested.property('location.hash', '#baz');
      });

      it('should update the `location` properties on the route component', async () => {
        await router.setRoutes([{ path: '(.*)', component: 'x-not-found-view' }], true);
        await router.render({
          pathname: '/non-existent/path',
          search: '?foo=bar',
          hash: '#baz',
        });
        await router.render({
          pathname: '/non-existent/path',
          search: '?foo=qux',
          hash: '#quz',
        });
        expect(outlet.children[0]).to.have.nested.property('location.pathname', '/non-existent/path');
        expect(outlet.children[0]).to.have.nested.property('location.search', '?foo=qux');
        expect(outlet.children[0]).to.have.nested.property('location.hash', '#quz');
      });

      it('should update the `location` properties on the route component on router.render(pathname)', async () => {
        await router.setRoutes([{ path: '(.*)', component: 'x-not-found-view' }], true);
        await router.render({
          pathname: '/non-existent/path',
          search: '?foo=bar',
          hash: '#baz',
        });
        await router.render('/non-existent/path');
        expect(outlet.children[0]).to.have.nested.property('location.pathname', '/non-existent/path');
        expect(outlet.children[0]).to.have.nested.property('location.search', '');
        expect(outlet.children[0]).to.have.nested.property('location.hash', '');
      });

      it('should keep route parameters when redirecting to different route', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/users/:id', redirect: '/user/:id' },
            { path: '/user/:id', component: 'x-users-view' },
          ],
          true,
        );
        await router.render('/users/1');
        const elem = outlet.children[0] as WebComponentInterface;
        expect(elem.tagName).to.match(/x-users-view/iu);
        expect(elem.location?.params).to.be.an('object');
        expect(elem.location?.params.id).to.equal('1');
      });

      it('should create new component instance for the same route with different parameters', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/users/:id', component: 'x-users-view' },
          ],
          true,
        );

        await router.render('/users/1');
        const elemOne = outlet.children[0] as WebComponentInterface;
        expect(elemOne.tagName).to.match(/x-users-view/iu);
        expect(elemOne.location?.params).to.be.an('object');
        expect(elemOne.location?.params.id).to.equal('1');

        await router.render('/users/2');
        const elemTwo = outlet.children[0] as WebComponentInterface;
        expect(elemTwo.tagName).to.match(/x-users-view/iu);
        expect(elemTwo).to.not.equal(elemOne);
        expect(elemTwo.location?.params).to.be.an('object');
        expect(elemTwo.location?.params.id).to.equal('2');
      });
    });

    describe('route object properties: order of execution', () => {
      beforeEach(() => {
        router = new Router(outlet);
      });

      it('action should be called with correct parameters', async () => {
        const action = sinon.spy((_context: RouteContext, _commands: Commands) => undefined);
        await router.setRoutes([{ path: '/', component: 'x-home-view', action }], true);

        await router.render('/');

        expect(action).to.have.been.calledOnce;
        expect(action.args[0].length).to.equal(2);

        let [[contextParam]] = action.args;
        expect(contextParam.pathname).to.equal('/');
        expect(contextParam.search).to.equal('');
        expect(contextParam.hash).to.equal('');
        expect(contextParam.route.path).to.equal('/');
        expect(contextParam.route.component).to.equal('x-home-view');

        const [[, commandsParam]] = action.args;
        expect(commandsParam).to.not.have.property('undefined');
        expect(commandsParam).to.have.property('redirect').which.is.a('function');
        expect(commandsParam).to.have.property('component').which.is.a('function');

        action.resetHistory();
        await router.render({ pathname: '/' });

        [[contextParam]] = action.args;
        expect(contextParam.pathname).to.equal('/');
        expect(contextParam.search).to.equal('');
        expect(contextParam.hash).to.equal('');

        action.resetHistory();
        await router.render({ pathname: '/', search: '?foo=bar', hash: '#baz' });

        [[contextParam]] = action.args;
        expect(contextParam.pathname).to.equal('/');
        expect(contextParam.search).to.equal('?foo=bar');
        expect(contextParam.hash).to.equal('#baz');
      });

      it('action.this points to the route that defines action', async () => {
        await router.setRoutes(
          [
            {
              path: '/',
              component: 'x-home-view',
              action(context) {
                expect(this.path).to.equal('/');
                expect(this.component).to.equal('x-home-view');
                expect(this).to.be.equal(context.route);
              },
            },
          ],
          true,
        );

        await router.render('/');

        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('action without return should be executed before redirect and allow it to happen', async () => {
        let actionExecuted = false;

        await router.setRoutes(
          [
            {
              path: '/test',
              redirect: '/home',
              action: () => {
                actionExecuted = true;
              },
            },
            { path: '/home', component: 'x-home-view' },
          ],
          true,
        );

        await router.render('/test');

        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
        expect(actionExecuted).to.equal(true);
      });

      it('action with return should be executed before redirect and stop it from happening', async () => {
        let actionExecuted = false;

        await router.setRoutes(
          [
            {
              path: '/home',
              redirect: '/users',
              async action(context) {
                actionExecuted = true;
                return await context.next();
              },
            },
            { path: '/home', component: 'x-home-view' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );

        await router.render('/home');

        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
        expect(actionExecuted).to.equal(true);
      });

      it('action with HTMLElement return should prevent redirect', async () => {
        await router.setRoutes(
          [
            {
              path: '/',
              // eslint-disable-next-line @typescript-eslint/unbound-method
              action(_context, commands) {
                return commands.component('x-main-layout');
              },
              redirect: '/users',
            },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );

        await router.render('/');
        checkOutlet(['x-main-layout']);
      });

      it('action with non-resolving return should not prevent route redirect', async () => {
        await Promise.all(
          [undefined, null, NaN, 0, false, '', 'thisIsAlsoNonResolving', {}, Object.create(null)].map(
            async (returnValue) => {
              const _router = new Router(outlet);
              const erroneousPath = '/error';
              let actionExecuted = false;
              await _router.setRoutes(
                [
                  {
                    path: erroneousPath,
                    redirect: '/users',
                    action: () => {
                      actionExecuted = true;
                      return returnValue;
                    },
                  },
                  { path: '/users', component: 'x-users-view' },
                ],
                true,
              );

              await _router.render(erroneousPath);
              expect(actionExecuted).to.equal(true);
              checkOutlet(['x-users-view']);
            },
          ),
        );
      });

      it('should redirect if action returns a Promise with non-resolving value', async () => {
        await Promise.all(
          [undefined, null, NaN, 0, false, '', 'thisIsAlsoNonResolving', {}, Object.create(null)].map(
            async (returnValue) => {
              const _router = new Router(outlet);
              const erroneousPath = '/error';
              let actionExecuted = false;
              await _router.setRoutes(
                [
                  {
                    path: erroneousPath,
                    redirect: '/users',
                    action: async () => {
                      actionExecuted = true;
                      return await Promise.resolve(returnValue);
                    },
                  },
                  { path: '/users', component: 'x-users-view' },
                ],
                true,
              );

              await _router.render(erroneousPath);
              expect(actionExecuted).to.equal(true);
              checkOutlet(['x-users-view']);
            },
          ),
        );
      });

      it('action with return should be executed before component and stop it from loading', async () => {
        let actionExecuted = false;

        await router.setRoutes(
          [
            {
              path: '/',
              component: 'x-home-view',
              action: async (context) => {
                actionExecuted = true;
                return await context.next();
              },
            },
            { path: '/', component: 'x-users-view' },
          ],
          true,
        );

        await router.render('/');

        expect(actionExecuted).to.equal(true);
        expect(outlet.children[0].tagName).to.match(/x-users-view/iu);
      });

      it('action can redirect by using the context method', async () => {
        await router.setRoutes(
          [
            { path: '/users/:id', action: (_context, _commands) => _commands.redirect('/user/:id') },
            { path: '/user/:id', component: 'x-users-view' },
          ],
          true,
        );

        await router.render('/users/1');

        const elem = outlet.children[0] as WebComponentInterface;
        expect(elem.tagName).to.match(/x-users-view/iu);
        expect(elem.location?.params).to.be.an('object');
        expect(elem.location?.params.id).to.equal('1');
      });

      it('action can render components by using the context method', async () => {
        await router.setRoutes(
          [{ path: '/users/:id', action: (_context, commands) => commands.component('x-users-view') }],
          true,
        );

        await router.render('/users/1');

        const elem = outlet.children[0] as WebComponentInterface;
        expect(elem.tagName).to.match(/x-users-view/iu);
        expect(elem.location?.params).to.be.an('object');
        expect(elem.location?.params.id).to.equal('1');
      });

      it('action can render components by returning HTMLElement directly', async () => {
        await router.setRoutes(
          [{ path: '/users/:id', action: (_context, _commands) => document.createElement('x-users-view') }],
          true,
        );

        await router.render('/users/1');

        const elem = outlet.children[0] as WebComponentInterface;
        expect(elem.tagName).to.match(/x-users-view/iu);
        expect(elem.location?.params).to.be.an('object');
        expect(elem.location?.params.id).to.equal('1');
      });

      it('action can render components by returning Promise to HTMLElement', async () => {
        await router.setRoutes(
          [
            {
              path: '/users/:id',
              action: async (_context, _commands) => await Promise.resolve(document.createElement('x-users-view')),
            },
          ],
          true,
        );

        await router.render('/users/1');

        const elem = outlet.children[0] as WebComponentInterface;
        expect(elem.tagName).to.match(/x-users-view/iu);
        expect(elem.location?.params).to.be.an('object');
        expect(elem.location?.params.id).to.equal('1');
      });

      it('redirect should be executed before component and stop it from loading', async () => {
        await router.setRoutes(
          [
            { path: '/test', redirect: '/users', component: 'x-home-view' },
            { path: '/users', component: 'x-users-view' },
          ],
          true,
        );

        await router.render('/test');

        expect(outlet.children[0].tagName).to.match(/x-users-view/iu);
      });

      it('should match routes with trailing slashes', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-a' },
            {
              path: '/child',
              children: [
                { path: '/', component: 'x-b' },
                { path: '/page/', component: 'x-c' },
              ],
            },
          ],
          true,
        );

        await router.render('/');
        checkOutlet(['x-a']);

        await router.render('/child/');
        checkOutlet(['x-b']);

        await router.render('/child/page/');
        checkOutlet(['x-c']);
      });
    });

    describe('route.action (function)', () => {
      beforeEach(() => {
        router = new Router(outlet);
      });

      it('result element should remain when rendering the same route', async () => {
        const result = document.createElement('div');

        await router.setRoutes([{ path: '/', action: () => result }], true);

        await router.render('/');
        await router.render('/');
        expect(outlet.children[0]).to.be.equal(result);
      });

      it('commands.redirect() should work when invoked without the `this` context', async () => {
        await router.setRoutes([
          { path: '/', component: 'x-home-view' },
          // eslint-disable-next-line @typescript-eslint/unbound-method
          { path: '/a', action: (_context, { redirect }) => redirect('/') },
        ]);

        await router.render('/a');

        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it("commands.redirect() should update redirect.from and the next action's context.redirectFrom", async () => {
        const from = '/a/b/c';

        await router.setRoutes(
          [
            {
              path: '/a',
              children: [
                {
                  path: '/b',
                  children: [
                    {
                      path: '/c',
                      action: (_context, commands) => {
                        const redirectObject = commands.redirect('/d');
                        expect(redirectObject.redirect.from).to.be.equal(from);
                        return redirectObject;
                      },
                    },
                  ],
                },
              ],
            },
            {
              path: '/d',
              component: 'x-home-view',
              action: (context) => {
                expect(context.redirectFrom).to.be.equal(from);
              },
            },
          ],
          true,
        );

        await router.render(from);

        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it("commands.redirect() should not produce double slashes in redirect.from and the next action's context.redirectFrom", async () => {
        let from: string | undefined;
        await router.setRoutes(
          [
            {
              path: '/',
              children: [
                { path: '', children: [{ path: '/c', action: (_context, commands) => commands.redirect('/d') }] },
              ],
            },
            {
              path: '/d',
              component: 'x-home-view',
              action: (context) => {
                from = context.redirectFrom;
              },
            },
          ],
          true,
        );

        await router.render('/c');

        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
        expect(from).to.be.equal('/c');
      });

      it('should be able to return different components for consecutive calls', async () => {
        let anonymous = true;
        await router.setRoutes(
          [
            {
              path: '/',
              component: 'x-home-view',
              action: (_context, commands) => {
                if (anonymous) {
                  return commands.component('x-login-view');
                }
                return undefined;
              },
            },
          ],
          true,
        );

        await router.render('/');
        expect(outlet.children[0].tagName).to.match(/x-login-view/iu);

        anonymous = false;
        await router.render('/');
        expect(outlet.children[0].tagName).to.match(/x-home-view/iu);
      });

      it('should reuse DOM instance even when route has completely different path', async () => {
        let sharedElementInstance: HTMLElement | null = null;
        let serverSideComponentId = 0;
        const action: Route['action'] = (context) => {
          sharedElementInstance ||= document.createElement('flow-root-outlet');
          const elm: HTMLElement = sharedElementInstance;
          // clear content
          elm.innerHTML = '';
          // Assumed this is an element return by server
          const content = document.createElement(`server-side-${context.pathname.substring(1)}`);
          content.textContent = context.pathname;
          // eslint-disable-next-line no-plusplus
          serverSideComponentId++;
          content.id = `flow${serverSideComponentId}`;
          elm.appendChild(content);
          // Return always the same instance of flow-root-outlet
          return elm;
        };
        await router.setRoutes(
          [
            {
              path: '/',
              children: [
                {
                  path: 'client-view',
                  component: 'x-client-view',
                },
                {
                  path: '(.*)',
                  action,
                },
              ],
            },
          ],
          true,
        );

        await router.render('/client-view');
        expect(outlet.children[0].tagName).to.match(/x-client-view/iu);

        await router.render('/server-view');
        expect(outlet.children[0]).to.be.equal(sharedElementInstance);
        expect(outlet.children[0].children[0].tagName).to.match(/server-side-server-view/iu);
        expect(outlet.children[0].children[0].id).to.be.equal(`flow${serverSideComponentId}`);
        expect(outlet.children[0].children[0].textContent).to.be.equal('/server-view');

        await router.render('/reviews-list');
        expect(outlet.children[0]).to.be.equal(sharedElementInstance);
        expect(outlet.children[0].children[0].tagName).to.match(/server-side-reviews-list/iu);
        expect(outlet.children[0].children[0].id).to.be.equal(`flow${serverSideComponentId}`);
        expect(outlet.children[0].children[0].textContent).to.be.equal('/reviews-list');
      });

      it('should keep tree structure and content when re-visiting the same route', async () => {
        const view = document.createElement('span');
        const action: Route['action'] = (ctx) => {
          view.textContent = ctx.pathname;
          return view;
        };
        await router.setRoutes(
          [
            {
              path: '/',
              component: 'main-layout',
              children: [
                {
                  path: '/categories',
                  component: 'input',
                },
                {
                  path: '(.*)',
                  action,
                },
              ],
            },
          ],
          true,
        );

        await router.render('/foo');
        expect(outlet.children[0].localName).to.be.equal('main-layout');
        expect(outlet.children[0].children[0].localName).to.be.equal('span');
        expect(outlet.children[0].children[0].textContent).to.be.equal('/foo');

        // Double click on the same route
        await router.render('/categories');
        expect(outlet.children[0].localName).to.be.equal('main-layout');
        expect(outlet.children[0].children[0].localName).to.be.equal('input');
        await router.render('/categories');
        expect(outlet.children[0].localName).to.be.equal('main-layout');
        expect(outlet.children[0].children[0].localName).to.be.equal('input');

        await router.render('/foo');
        expect(outlet.children[0].localName).to.be.equal('main-layout');
        expect(outlet.children[0].children[0].localName).to.be.equal('span');
        expect(outlet.children[0].children[0].textContent).to.be.equal('/foo');
      });
    });

    describe('route.action (function) return the same element tag with different content', () => {
      beforeEach(() => {
        router = new Router(outlet);
      });

      it('should keep the element instance in the DOM when reuse the same instance with different content', async () => {
        let sharedElementInstance: HTMLElement | null = null;
        let dynamicContent = 'First content';
        const action: Route['action'] = (_context) => {
          sharedElementInstance ||= document.createElement('div');
          const elm: HTMLElement = sharedElementInstance;
          // clear content
          elm.innerHTML = '';
          // Add some new content to the element
          const content = document.createElement('span');
          content.textContent = dynamicContent;
          elm.appendChild(content);
          // Return always the same instance of the element
          return elm;
        };
        await router.setRoutes([{ path: '/', action }], true);

        await router.ready;
        await router.render('/');
        expect(outlet.children[0]).to.be.equal(sharedElementInstance);
        expect(outlet.textContent).to.be.equal(dynamicContent);

        dynamicContent = 'Second content';
        // It should not disappear on the secondtime
        await router.render('/');
        expect(outlet.children[0]).to.be.equal(sharedElementInstance);
        expect(outlet.textContent).to.be.equal(dynamicContent);
      });

      it('should show the new content correctly when return a different instance but same tag name', async () => {
        let dynamicContent = 'First content';
        const action: Route['action'] = (_context) => {
          const elm = document.createElement('div');
          // clear content
          elm.innerHTML = '';
          // Add some new content to the element
          const content = document.createElement('span');
          content.textContent = dynamicContent;
          elm.appendChild(content);
          // Return always the same instance of the element
          return elm;
        };
        await router.setRoutes([{ path: '/', action }], true);

        await router.render('/');
        expect(outlet.textContent).to.be.equal(dynamicContent);

        dynamicContent = 'Second content';
        // It should not disappear on the secondtime
        await router.render('/');
        expect(outlet.textContent).to.be.equal(dynamicContent);
      });

      it('should change parent content when parent is different but child is the same instance', async () => {
        const textContent = 'Text content';
        let sharedElementInstance: HTMLElement | null = null;
        const action: Route['action'] = (_context) => {
          sharedElementInstance ||= document.createElement('x-edit');
          const elm: HTMLElement = sharedElementInstance;
          // clear content
          elm.innerHTML = '';
          // Add some new content to the element
          const content = document.createElement('span');
          content.textContent = textContent;
          elm.appendChild(content);
          // Return always the same instance of the element
          return elm;
        };
        await router.setRoutes(
          [
            {
              path: '/',
              component: 'x-home',
            },
            {
              path: '/users/:name/',
              action: (context) => {
                const userEl = document.createElement('x-user');
                const avatarEl = document.createElement('x-fancy-name');
                avatarEl.textContent = String(context.params.name);
                userEl.appendChild(avatarEl);
                return userEl;
              },
              children: [
                {
                  path: 'edit',
                  action,
                },
                {
                  path: 'profile',
                  component: 'x-profile',
                },
              ],
            },
          ],
          true,
        );
        await router.render('/users/john/edit');
        expect(outlet.children[0].tagName).to.match(/x-user/iu);
        expect(outlet.children[0].children[0].tagName).to.match(/x-fancy-name/iu);
        expect(outlet.children[0].children[0].textContent).to.match(/john/iu);
        expect(outlet.children[0].children[1].tagName).to.match(/x-edit/iu);
        expect(outlet.children[0].children[1].textContent).to.be.equal(textContent);

        await router.render('/users/cena/edit');
        expect(outlet.children[0].tagName).to.match(/x-user/iu);
        expect(outlet.children[0].children[0].tagName).to.match(/x-fancy-name/iu);
        expect(outlet.children[0].children[0].textContent).to.match(/cena/iu);
        expect(outlet.children[0].children[1].tagName).to.match(/x-edit/iu);
        expect(outlet.children[0].children[1].textContent).to.be.equal(textContent);
      });
    });

    describe('animated transitions', () => {
      let observer: MutationObserver;
      let data: MutationRecord[] = [];

      beforeEach(() => {
        router = new Router(outlet);
        observer = new window.MutationObserver((records) => {
          data = data.concat(records);
        });
      });

      afterEach(() => {
        observer.disconnect();
      });

      it('should set and then remove the CSS classes, if `animate` is set to true', async () => {
        await router.setRoutes(
          [
            { path: '/', component: 'x-home-view' },
            { path: '/animate', component: 'x-animate-view', animate: true },
          ],
          true,
        );

        await router.render('/');

        observer.observe(outlet, {
          subtree: true,
          attributes: true,
          attributeOldValue: true,
          attributeFilter: ['class'],
        });

        await router.render('/animate');

        // FIXME(web-padawan): force IE11 to pick up mutations
        if (navigator.userAgent.includes('Trident') && data.length !== 4) {
          data = observer.takeRecords();
        }

        expect(data.length).to.equal(4);
        expect((data[0].target as HTMLElement).tagName).to.match(/x-home-view/iu);
        expect((data[1].target as HTMLElement).tagName).to.match(/x-home-view/iu);
        expect(data[1].oldValue).to.equal('leaving');
        expect((data[2].target as HTMLElement).tagName).to.match(/x-animate-view/iu);
        expect((data[3].target as HTMLElement).tagName).to.match(/x-animate-view/iu);
        expect(data[3].oldValue).to.equal('entering');
      });
    });

    describe('window.Vaadin.registrations', () => {
      it('should contain a single record for the Vaadin Router usage', () => {
        // @ts-ignore Vaadin runtime object
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        const registrations = window.Vaadin.registrations.filter((reg) => reg.is === '@vaadin/router');

        expect(registrations).to.have.lengthOf(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect((registrations as readonly unknown[])[0]).to.have.property('version').that.is.a.string;
      });
    });
  });
});

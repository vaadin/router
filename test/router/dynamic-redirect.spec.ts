import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { Router } from '../../src/router.js';

declare global {
  interface Window {
    ShadyDOM?: unknown;
  }
}

describe('Vaadin.Router', function () {
  // eslint-disable-next-line no-invalid-this
  const suite = this;
  suite.title = suite.title + (window.ShadyDOM ? ' (Shady DOM)' : '');

  let outlet: HTMLElement;

  before(() => {
    outlet = document.createElement('div');
    document.body.append(outlet);
  });

  after(() => {
    outlet.remove();
  });

  let router: Router;

  beforeEach(async function () {
    const test = this;

    for (const child of outlet.children) {
      child.remove();
    }

    // reset the window URL
    window.history.pushState(null, '', '/');

    // create a new router instance
    router = new Router(outlet);
  });

  afterEach(() => {
    router.unsubscribe();
  });

  describe('resolver chain and router features', () => {
    it('redirect overwrites activated routes', async () => {
      await router.setRoutes([
        { path: '/a', children: [{ path: '/b', children: [{ path: '/c', component: 'x-home-view' }] }] },
        { path: '/', redirect: '/a/b/c' },
      ]);

      await router.render('/');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
    });

    it('action that returns custom component activates route', async () => {
      await router.setRoutes([{ path: '/', action: (context, commands) => commands.component('x-home-view') }]);

      await router.render('/');

      verifyActiveRoutes(router, ['/']);
    });

    it('action that returns redirect activates redirect route', async () => {
      await router.setRoutes([
        { path: '/', action: (context, commands) => commands.redirect('/a') },
        { path: '/a', component: 'x-users-view' },
      ]);

      await router.render('/');

      verifyActiveRoutes(router, ['/a']);
      expect((outlet.lastChild as HTMLElement).tagName).to.match(/x-users-view/i);
    });

    it('should be able to have multiple action redirects', async () => {
      await router.setRoutes([
        { path: '/', action: (context, commands) => commands.redirect('/u') },
        { path: '/u', action: (context, commands) => commands.redirect('/users') },
        { path: '/users', component: 'x-users-list' },
      ]);

      await router.render('/');

      expect((outlet.lastChild as HTMLElement).tagName).to.match(/x-users-list/i);
      verifyActiveRoutes(router, ['/users']);
    });

    it('should fail on recursive action redirects', async () => {
      // Assure that outlet is emptied.
      outlet.innerHTML = '';

      await router.setRoutes([
        { path: '/a', action: (context, commands) => commands.redirect('/b') },
        { path: '/b', action: (context, commands) => commands.redirect('/c') },
        { path: '/c', action: (context, commands) => commands.redirect('/a') },
      ]);

      const onError = sinon.spy();
      await router.render('/a').catch(onError);

      expect(outlet.children).to.have.lengthOf(0);
      expect(onError).to.have.been.calledOnce;
    });

    it('should use `window.replaceState()` when redirecting from action on first render', async () => {
      const pushSpy = sinon.spy(window.history, 'pushState');
      const replaceSpy = sinon.spy(window.history, 'replaceState');

      await router.setRoutes(
        [
          { path: '/', action: (context, commands) => commands.redirect('/a') },
          { path: '/a', component: 'x-users-view' },
        ],
        true,
      );

      await router.render('/', true);

      expect(pushSpy).to.not.be.called;
      expect(replaceSpy).to.be.calledOnce;

      pushSpy.restore();
      replaceSpy.restore();
    });

    it('should use `window.pushState()` when redirecting from action on next renders', async () => {
      await router.setRoutes([
        { path: '/', action: (context, commands) => commands.redirect('/a') },
        { path: '/a', component: 'x-users-view' },
        { path: '/b', component: 'x-users-view' },
      ]);
      await router.render('/b', true);

      const pushSpy = sinon.spy(window.history, 'pushState');
      const replaceSpy = sinon.spy(window.history, 'replaceState');

      await router.render('/', true);

      expect(pushSpy).to.be.calledOnce;
      expect(replaceSpy).to.not.be.called;

      // Make non-redirecting render to update the URL
      await router.render('/b', true);

      expect(pushSpy).to.be.calledTwice;
      expect(replaceSpy).to.not.be.called;

      // Redirecting navigation again
      await router.render('/', true);

      expect(pushSpy).to.be.calledThrice;
      expect(replaceSpy).to.not.be.called;

      pushSpy.restore();
      replaceSpy.restore();
    });
  });
});

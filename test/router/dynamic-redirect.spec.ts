import { expect, use } from "@esm-bundle/chai";
import chaiAsPromised from "chai-as-promised";
import chaiDom from "chai-dom";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { Router } from '../../src/router.js';
import { cleanup, verifyActiveRoutes } from "./test-utils.js";

use(chaiDom);
use(sinonChai);
use(chaiAsPromised);

declare global {
  interface Window {
    ShadyDOM?: unknown;
  }
}

describe('Vaadin.Router', function() {
  const suite = this;
  suite.title = suite.title + (window.ShadyDOM ? ' (Shady DOM)' : '');

  let outlet: HTMLElement;
  let router: Router;

  const DEFAULT_URL = location.href;

  before(() => {
    outlet = document.createElement('div');
    document.body.append(outlet);
  });

  after(() => {
    outlet.remove();
  });

  beforeEach(async () => {
    history.pushState(null, '', location.origin);
    cleanup(outlet);

    // create a new router instance
    router = new Router(outlet);
  });

  afterEach(() => {
    router.unsubscribe();
    history.pushState(null, '', DEFAULT_URL);
  });

  describe('resolver chain and router features', () => {
    it('redirect overwrites activated routes', async() => {
      router.setRoutes([
        {path: '/a', children: [
            {path: '/b', children: [
                {path: '/c', component: 'x-home-view'}
              ]},
          ]},
        {path: '/', redirect: '/a/b/c'},
      ]);

      await router.render('/');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
    });

    it('action that returns custom component activates route', async() => {
      router.setRoutes([
        {path: '/', action: (context, commands) => commands.component('x-home-view')},
      ]);

      await router.render('/');

      verifyActiveRoutes(router, ['/']);
    });

    it('action that returns redirect activates redirect route', async() => {
      router.setRoutes([
        {path: '/', action: (context, commands) => commands.redirect('/a')},
        {path: '/a', component: 'x-users-view'},
      ]);

      await router.render('/');

      verifyActiveRoutes(router, ['/a']);
      expect(outlet.lastChild.tagName).to.match(/x-users-view/i);
    });

    it('should be able to have multiple action redirects', async() => {
      router.setRoutes([
        {path: '/', action: (context, commands) => commands.redirect('/u')},
        {path: '/u', action: (context, commands) => commands.redirect('/users')},
        {path: '/users', component: 'x-users-list'}
      ]);

      await router.render('/');

      expect(outlet.lastChild.tagName).to.match(/x-users-list/i);
      verifyActiveRoutes(router, ['/users']);
    });

    it('should fail on recursive action redirects', async() => {
      router.setRoutes([
        {path: '/a', action: (context, commands) => commands.redirect('/b')},
        {path: '/b', action: (context, commands) => commands.redirect('/c')},
        {path: '/c', action: (context, commands) => commands.redirect('/a')},
      ]);

      const onError = sinon.spy();
      await router.render('/a').catch(onError);

      expect(outlet.children).to.have.lengthOf(0);
      expect(onError).to.have.been.calledOnce;
    });

    it('should use `window.replaceState()` when redirecting from action on first render', async() => {
      const pushSpy = sinon.spy(window.history, 'pushState');
      const replaceSpy = sinon.spy(window.history, 'replaceState');

      router.setRoutes([
        {path: '/', action: (context, commands) => commands.redirect('/a')},
        {path: '/a', component: 'x-users-view'},
      ], true);

      await router.render('/', true);

      expect(pushSpy).to.not.be.called;
      expect(replaceSpy).to.be.calledOnce;

      window.history.pushState.restore();
      window.history.replaceState.restore();
    });

    it('should use `window.pushState()` when redirecting from action on next renders', async() => {
      router.setRoutes([
        {path: '/', action: (context, commands) => commands.redirect('/a')},
        {path: '/a', component: 'x-users-view'},
        {path: '/b', component: 'x-users-view'},
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

      window.history.pushState.restore();
      window.history.replaceState.restore();
    });
  });
});

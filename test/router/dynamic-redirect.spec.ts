import { expect, use } from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Router } from '../../src/router.js';
import '../setup.js';
import { cleanup, verifyActiveRoutes } from './test-utils.js';

use(chaiDom);
use(sinonChai);
use(chaiAsPromised);

// eslint-disable-next-line prefer-arrow-callback
describe('Vaadin.Router', () => {
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
    cleanup(outlet);
    router.unsubscribe();
  });

  describe('resolver chain and router features', () => {
    it('redirect overwrites activated routes', async () => {
      await router.setRoutes(
        [
          { path: '/a', children: [{ path: '/b', children: [{ path: '/c', component: 'x-home-view' }] }] },
          { path: '/', redirect: '/a/b/c' },
        ],
        true,
      );

      await router.render('/');

      verifyActiveRoutes(router, ['/a', '/b', '/c']);
    });

    it('action that returns custom component activates route', async () => {
      await router.setRoutes([{ path: '/', action: (_context, commands) => commands.component('x-home-view') }], true);

      await router.render('/');

      verifyActiveRoutes(router, ['/']);
    });

    it('action that returns redirect activates redirect route', async () => {
      await router.setRoutes(
        [
          { path: '/', action: (_context, commands) => commands.redirect('/a') },
          { path: '/a', component: 'x-users-view' },
        ],
        true,
      );

      await router.render('/');

      verifyActiveRoutes(router, ['/a']);
      expect(outlet.lastChild)
        .to.have.property('tagName')
        .that.matches(/x-users-view/iu);
    });

    it('should be able to have multiple action redirects', async () => {
      await router.setRoutes(
        [
          { path: '/', action: (_context, commands) => commands.redirect('/u') },
          { path: '/u', action: (_context, commands) => commands.redirect('/users') },
          { path: '/users', component: 'x-users-list' },
        ],
        true,
      );

      await router.render('/');

      expect(outlet.lastChild)
        .to.have.property('tagName')
        .that.matches(/x-users-list/iu);
      verifyActiveRoutes(router, ['/users']);
    });

    it('should fail on recursive action redirects', async () => {
      await router.setRoutes(
        [
          { path: '/a', action: (_context, commands) => commands.redirect('/b') },
          { path: '/b', action: (_context, commands) => commands.redirect('/c') },
          { path: '/c', action: (_context, commands) => commands.redirect('/a') },
        ],
        true,
      );

      const onError = sinon.spy();
      // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
      await router.render('/a').catch(onError);

      expect(outlet.children).to.have.lengthOf(0);
      expect(onError).to.have.been.calledOnce;
    });
  });
});

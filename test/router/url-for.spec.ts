import { expect } from '@esm-bundle/chai';
import { Router } from '../../src/router.js';
import '../setup.js';
import { cleanup } from './test-utils.js';

describe('urlFor', () => {
  let outlet: HTMLElement;
  let router: Router;

  before(() => {
    outlet = document.createElement('div');
    document.body.append(outlet);
  });

  after(() => {
    outlet.remove();
  });

  beforeEach(async () => {
    cleanup(outlet);

    // create a new router instance
    router = new Router(outlet);
  });

  afterEach(() => {
    router.unsubscribe();
  });

  describe('urlForName method', () => {
    beforeEach(() =>
      router.setRoutes(
        [
          {
            name: 'app',
            path: '/app/(.*)?',
            component: 'x-app',
            children: [
              { name: 'home', path: '/home', component: 'x-home-view' },
              { name: 'user', path: '/users/:userId', component: 'x-user-view' },
              { name: 'user-profile', path: '/users/:userId/(.*)', component: 'x-user-profile' },
              { path: '/users', component: 'x-user-list' },
            ],
          },
        ],
        true,
      ),
    );

    it('should exist', () => {
      expect(router.urlForName).to.be.instanceof(Function);
    });

    it('should accept first-level route name', () => {
      expect(router.urlForName('app')).to.equal('/app');
    });

    it('should accept child route name', () => {
      expect(router.urlForName('home')).to.equal('/app/home');
    });

    it('should fallback to component name', () => {
      expect(router.urlForName('x-user-list')).to.equal('/app/users');
    });

    it('should drop extra path delimeters', () => {
      router.setRoutes([
        {
          name: 'root',
          path: '/',
          component: 'x-root',
          children: [
            {
              name: 'home',
              path: '/home/',
              component: 'x-home',
              children: [{ name: 'dashboard', path: '/dashboard/', component: 'x-dashboard' }],
            },
          ],
        },
      ]);

      expect(router.urlForName('dashboard')).to.equal('/home/dashboard/');
    });

    it('should not throw for children function', () => {
      router.setRoutes([{ name: 'root', path: '/', component: 'x-root', children: () => [] }]);

      expect(() => {
        expect(router.urlForName('root')).to.equal('/');
      }).to.not.throw();
    });

    it('should allow setting new routes with old names', () => {
      // Warm up the cache
      expect(router.urlForName('app')).to.equal('/app');
      expect(router.urlForName('home')).to.equal('/app/home');
      expect(router.urlForName('x-user-list')).to.equal('/app/users');

      router.setRoutes(
        [
          {
            name: 'app',
            path: '/new-app',
            component: 'x-app',
            children: [
              { name: 'home', path: '/new-home', component: 'x-home-view' },
              { path: '/new-users', component: 'x-user-list' },
            ],
          },
        ],
        true,
      );

      expect(router.urlForName('app')).to.equal('/new-app');
      expect(router.urlForName('home')).to.equal('/new-app/new-home');
      expect(router.urlForName('x-user-list')).to.equal('/new-app/new-users');
    });

    it('should support named parameters', () => {
      expect(router.urlForName('user', { userId: 42 })).to.equal('/app/users/42');
    });

    it('should support unnamed parameters', () => {
      expect(router.urlForName('app', { 0: 42 })).to.equal('/app/42');
    });

    it('should support named and unnamed parameters', () => {
      expect(router.urlForName('user-profile', { userId: 42, 0: null, 1: 'profile' })).to.equal(
        '/app/users/42/profile',
      );
    });

    it('should ignore unknown params', () => {
      expect(router.urlForName('user', { userId: 42, foo: 'bar' })).to.equal('/app/users/42');
    });

    it('should throw for not found name', () => {
      expect(() => router.urlForName('foo', {})).to.throw('Route "foo" not found');
    });

    it('should throw for route name duplicating route name', () => {
      router.setRoutes([
        { name: 'foo', path: '/', component: 'x-foo-1' },
        { name: 'foo', path: '/', component: 'x-foo-2' },
        { name: 'x-unique', path: '/', component: 'x-unique' },
      ]);
      expect(() => router.urlForName('foo')).to.throw('Duplicate');
      expect(() => router.urlForName('x-unique')).to.not.throw();
    });

    it('should throw for component name duplicating route name', () => {
      router.setRoutes([
        { name: 'x-foo', path: '/', component: 'x-foo-1' },
        { path: '/', component: 'x-foo' },
        { path: '/', component: 'x-unique' },
      ]);
      expect(() => router.urlForName('x-foo')).to.throw('Duplicate');
      expect(() => router.urlForName('x-unique')).to.not.throw();
    });

    it('should throw for route name duplicating component name', () => {
      router.setRoutes([
        { path: '/', component: 'x-foo' },
        { name: 'x-foo', path: '/', component: 'x-foo-2' },
        { name: 'x-unique', path: '/', component: 'x-unique' },
      ]);
      expect(() => router.urlForName('x-foo')).to.throw('Duplicate');
      expect(() => router.urlForName('x-unique')).to.not.throw('not found');
    });

    it('should throw for component name duplicating component name', () => {
      router.setRoutes([
        { path: '/', component: 'x-foo' },
        { path: '/', component: 'x-foo' },
        { path: '/', component: 'x-unique' },
      ]);
      expect(() => router.urlForName('x-foo')).to.throw('Duplicate');
      expect(() => router.urlForName('x-unique')).to.not.throw();
    });

    it('should not use component name when name is assigned', () => {
      router.setRoutes([{ name: 'foo', path: '/', component: 'x-foo' }]);
      expect(() => router.urlForName('x-foo')).to.throw('');
    });

    it('should prepend baseUrl', () => {
      router.baseUrl = '/base/';
      router.setRoutes([
        { name: 'with-slash', path: '/foo', component: 'x-foo' },
        { name: 'without-slash', path: 'bar', component: 'x-bar' },
      ]);

      expect(router.urlForName('with-slash')).to.equal('/base/foo');
      expect(router.urlForName('without-slash')).to.equal('/base/bar');
    });

    // cannot mock the call to `parse()` from the 'pathToRegexp' package
    xit('should use pathToRegexp', () => {
      const parse = sinon.spy(Router.pathToRegexp, 'parse');

      try {
        const name = 'user',
          path = '/app/(.*)?/users/:userId',
          parameters = { userId: 42, foo: 'bar' };
        const result = router.urlForName(name, parameters);

        expect(parse).to.be.calledOnce;
        expect(parse).to.be.calledWithMatch(path);
        expect(result).to.equal('/app/users/42');
      } finally {
        Router.pathToRegexp.parse.restore();
      }
    });
  });

  describe('urlForPath method', () => {
    it('should exist', () => {
      expect(router.urlForPath).to.be.instanceof(Function);
    });

    it('should accept path', () => {
      expect(router.urlForPath('/users')).to.equal('/users');
    });

    it('should support named parameters', () => {
      expect(router.urlForPath('/users/:userId', { userId: 42 })).to.equal('/users/42');
    });

    it('should support unnamed parameters', () => {
      expect(router.urlForPath('/users/(.*)', { 0: 42 })).to.equal('/users/42');
    });

    it('should support named and unnamed parameters', () => {
      expect(router.urlForPath('/users/:userId/(.*)', { userId: 42, 0: 'profile' })).to.equal('/users/42/profile');
    });

    it('should ignore unknown params', () => {
      expect(router.urlForPath('/users/:userId', { userId: 42, foo: 'bar' })).to.equal('/users/42');
    });

    it('should prepend baseUrl', () => {
      router.baseUrl = '/base/';
      expect(router.urlForPath('foo')).to.equal('/base/foo');
      expect(router.urlForPath('/bar')).to.equal('/base/bar');
    });

    // cannot mock the call to `compile()` from the 'pathToRegexp' package
    xit('should use pathToRegexp', () => {
      const compiledRegExp = sinon.stub().returns('/ok/url');
      const compile = sinon.stub(Router.pathToRegexp, 'compile').returns(compiledRegExp);

      try {
        const path = '/users/:userId',
          parameters = { userId: 42, foo: 'bar' };
        const result = router.urlForPath(path, parameters);

        expect(compile).to.be.calledOnce;
        expect(compile).to.be.calledWith(path);
        expect(compiledRegExp).to.be.calledOnce;
        expect(compiledRegExp).to.be.calledWithMatch(parameters);
        expect(compiledRegExp).to.have.returned('/ok/url');
        expect(result).to.equal('/ok/url');
      } finally {
        Router.pathToRegexp.compile.restore();
      }
    });
  });
});

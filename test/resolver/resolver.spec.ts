/**
 * Universal resolver (https://www.kriasoft.com/universal-resolver/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { expect, use } from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Resolver from '../../src/resolver/resolver.js';
import '../setup.js';
import type { RouteContext } from '../../src/types.js';

use(chaiDom);
use(sinonChai);
use(chaiAsPromised);

describe('Resolver', () => {
  describe('new Resolver(routes, options)', () => {
    it('should throw an error in case of invalid routes', async () => {
      // @ts-expect-error: error-throwing test
      expect(() => new Resolver()).to.throw(TypeError, /Invalid routes/u);
      // @ts-expect-error: error-throwing test
      expect(() => new Resolver(12)).to.throw(TypeError, /Invalid routes/u);
      // @ts-expect-error: error-throwing test
      expect(() => new Resolver(null)).to.throw(TypeError, /Invalid routes/u);
    });

    it('should support custom resolve option for declarative routes', async () => {
      const resolveRoute = sinon.spy(async (context: RouteContext) => context.route.component);
      const action = sinon.spy(() => '');
      const resolver = new Resolver<string>(
        {
          action,
          children: [
            { action, component: undefined, path: '/:b' },
            { action, component: 'c', path: '/c' },
            { action, component: 'd', path: '/d' },
          ],
          path: '/a',
        },
        { resolveRoute },
      );
      const result = await resolver.resolve('/a/c');
      expect(resolveRoute.calledThrice).to.be.true;
      expect(action.called).to.be.false;
      expect(result).to.be.equal('c');
    });

    it('should support custom error handler option', async () => {
      const errorHandler = sinon.spy(() => 'result');
      const resolver = new Resolver([], { errorHandler });
      const result = await resolver.resolve('/');
      expect(result).to.be.equal('result');
      expect(errorHandler.calledOnce).to.be.true;
      const error = errorHandler.firstCall.firstArg;
      expect(error).to.be.an('error');
      expect(error)
        .to.have.property('message')
        .that.matches(/Page not found/u);
      expect(error).to.have.property('code', 404);
      expect(error).to.have.property('context').that.includes({ pathname: '/', resolver });
    });

    it('should handle route errors', async () => {
      const errorHandler = sinon.spy(() => 'result');
      const route = {
        action: () => {
          throw new Error('custom');
        },
        path: '/',
      };
      const resolver = new Resolver<string>(route, { errorHandler });
      const result = await resolver.resolve('/');
      expect(result).to.be.equal('result');
      expect(errorHandler).to.be.calledOnce;

      const error = errorHandler.firstCall.firstArg;
      expect(error).to.be.an('error');
      expect(error).to.have.property('message').that.equals('custom');
      expect(error).to.have.property('code', 500);
      expect(error).to.have.property('context').that.includes({ pathname: '/', resolver });
      expect(error).to.have.nested.property('context.route').that.includes(route);
    });
  });

  describe('router JS API', () => {
    it('should have a getter for the routes config', () => {
      const router = new Resolver([]);
      const actual = router.getRoutes();
      expect(actual).to.be.an('array').that.is.empty;
    });

    it('should have a setter for the routes config', () => {
      const router = new Resolver([]);
      router.setRoutes([{ component: 'x-home-view', path: '/' }]);
      const actual = router.getRoutes();
      expect(actual).to.be.an('array').that.has.lengthOf(1);
      expect(actual[0]).to.have.property('path', '/');
      expect(actual[0]).to.have.property('component', 'x-home-view');
    });

    it('should have a method for adding routes', () => {
      const router = new Resolver([]);

      // @ts-expect-error: testing protected method
      const newRoutes = router.addRoutes([{ component: 'x-home-view', path: '/' }]);

      const actual = router.getRoutes();
      expect(newRoutes).to.deep.equal(actual);
      expect(actual)
        .to.be.an('array')
        .that.deep.equals([{ component: 'x-home-view', path: '/' }]);
    });

    it('should have a method for removing routes', () => {
      const router = new Resolver([{ component: 'x-home-view', path: '/' }]);
      expect(router.getRoutes()).to.be.an('array').that.has.lengthOf(1);

      router.removeRoutes();

      expect(router.getRoutes()).to.be.an('array').that.has.lengthOf(0);
    });
  });

  describe('resolver.resolve({ pathname, ...context })', () => {
    it('should throw an error if no route found', async () => {
      const resolver = new Resolver([]);
      let error;
      try {
        await resolver.resolve('/');
      } catch (e) {
        error = e;
      }
      expect(error).to.be.an('error');
      expect(error)
        .to.have.property('message')
        .that.matches(/Page not found/u);
      expect(error).to.have.property('code').that.equals(404);
      expect(error).to.have.property('context').that.includes({ path: undefined, pathname: '/', resolver });
    });

    it("should execute the matching route's action method and return its result", async () => {
      const action = sinon.spy(() => 'b');
      const resolver = new Resolver({ action, path: '/a' });
      const context = await resolver.resolve('/a');
      expect(action.calledOnce).to.be.true;
      expect(action.firstCall.firstArg).to.have.nested.property('route.path', '/a');
      expect(context).to.be.equal('b');
    });

    it('should find the first route whose action method !== undefined or null', async () => {
      const action1 = sinon.spy(() => undefined);
      const action2 = sinon.spy(() => null);
      const action3 = sinon.spy(() => 'c');
      const action4 = sinon.spy(() => 'd');
      const resolver = new Resolver([
        { action: action1, path: '/a' },
        { action: action2, path: '/a' },
        { action: action3, path: '/a' },
        { action: action4, path: '/a' },
      ]);
      const context = await resolver.resolve('/a');
      expect(context).to.be.equal('c');
      expect(action1.calledOnce).to.be.true;
      expect(action2.calledOnce).to.be.true;
      expect(action3.calledOnce).to.be.true;
      expect(action4.called).to.be.false;
    });

    it('should be able to pass context variables to action methods', async () => {
      const action = sinon.spy(() => true);
      const resolver = new Resolver([{ action, path: '/a' }]);
      const context = await resolver.resolve({ pathname: '/a', test: 'b' });
      expect(action.calledOnce).to.be.true;
      expect(action.firstCall.firstArg).to.have.nested.property('route.path', '/a');
      expect(action.firstCall.firstArg).to.have.property('test', 'b');
      expect(context).to.be.true;
    });

    it("should not call action methods of routes that don't match the URL path", async () => {
      const action = sinon.spy();
      const resolver = new Resolver([{ action, path: '/a' }]);
      let err;
      try {
        await resolver.resolve('/b');
      } catch (e) {
        err = e;
      }
      expect(err).to.be.an('error');
      expect(err)
        .to.have.property('message')
        .that.matches(/Page not found/u);
      expect(err).to.have.property('code').that.equals(404);
      expect(action.called).to.be.false;
    });

    it('should support asynchronous route actions', async () => {
      const resolver = new Resolver([{ action: async () => 'b', path: '/a' }]);
      const result = await resolver.resolve('/a');
      expect(result).to.be.equal('b');
    });

    it('URL parameters are captured and added to context.params', async () => {
      const action = sinon.spy(() => true);
      const resolver = new Resolver([{ action, path: '/:one/:two' }]);
      const result = await resolver.resolve({ pathname: '/a/b' });
      expect(action.calledOnce).to.be.true;
      expect(action.firstCall.firstArg).to.have.property('params').that.deep.equals({ one: 'a', two: 'b' });
      expect(result).to.be.true;
    });

    it('context.chain contains the path to the last matched route if context.next() is called', async () => {
      const resolver = new Resolver([
        { action: async (context) => context.next(), name: 'first', path: '/a' },
        { action: () => true, name: 'second', path: '/a' },
      ]);
      await resolver.resolve({ pathname: '/a' });
      expect(resolver.context.chain).to.be.an('array').lengthOf(1);
      expect(resolver.context.chain?.[0].route).to.be.an('object');
      expect(resolver.context.chain?.[0].route?.name).to.equal('second');
    });

    it('the path to the route that produced the result, and the matched path are in the `context` (1))', async () => {
      const resolver = new Resolver([{ action: () => true, path: '/a/b' }]);
      await resolver.resolve({ pathname: '/a/b' });
      expect(resolver.context.chain).to.be.an('array').lengthOf(1);
      expect(resolver.context.chain?.[0].path).to.equal('/a/b');
      expect(resolver.context.chain?.[0].route?.path).to.equal('/a/b');
    });

    it('paths with parameters should have each route activated without parameters replaced', async () => {
      const resolver = new Resolver([
        { action: () => 'x-user-profile', path: '/users/:user' },
        { action: () => 'x-image-view', path: '/image-:size(\\d+)px' },
        { action: () => 'x-knowledge-base', path: '/kb/:path+/:id' },
      ]);

      await resolver.resolve('/users/1');
      expect(resolver.context.chain).to.be.an('array').lengthOf(1);
      expect(resolver.context.chain?.[0].route?.path).to.equal('/users/:user');

      await resolver.resolve('/image-15px');
      expect(resolver.context.chain).to.be.an('array').lengthOf(1);
      expect(resolver.context.chain?.[0].route?.path).to.equal('/image-:size(\\d+)px');

      await resolver.resolve('/kb/folder/nested/1');
      expect(resolver.context.chain).to.be.an('array').lengthOf(1);
      expect(resolver.context.chain?.[0].route?.path).to.equal('/kb/:path+/:id');
    });

    it('the path to the route that produced the result is in the `context` (2)', async () => {
      const resolver = new Resolver([
        {
          children: [
            {
              action: () => true,
              path: '/b',
            },
          ],
          path: '/a',
        },
      ]);
      await resolver.resolve({ pathname: '/a/b' });
      expect(resolver.context.chain).to.be.an('array').lengthOf(2);
      expect(resolver.context.chain?.[0].route?.path).to.equal('/a');
      expect(resolver.context.chain?.[1].route?.path).to.equal('/b');
    });

    it('the path to the route that produced the result is in the `context` (3)', async () => {
      const resolver = new Resolver([
        {
          children: [
            {
              children: [
                {
                  action: () => true,
                  path: '/a',
                },
              ],
              path: '',
            },
          ],
          path: '/',
        },
        { action: () => true, path: '/b' },
      ]);
      await resolver.resolve({ pathname: '/b' });
      const { context } = resolver;
      expect(context.chain).to.be.an('array').lengthOf(1);
      expect(context.chain?.[0].route?.path).to.equal('/b');
    });

    it('should provide all URL parameters to each route', async () => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          action: action1,
          children: [
            {
              action: action2,
              path: '/:two',
            },
          ],
          path: '/:one',
        },
      ]);
      const context = await resolver.resolve({ pathname: '/a/b' });
      expect(action1.calledOnce).to.be.true;
      expect(action1.firstCall.firstArg).to.have.property('params').that.deep.equals({ one: 'a' });
      expect(action2.calledOnce).to.be.true;
      expect(action2.firstCall.firstArg).to.have.property('params').that.deep.equals({ one: 'a', two: 'b' });
      expect(context).to.be.true;
    });

    it('should override URL parameters with same name in child route', async () => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          action: action1,
          children: [
            {
              action: action1,
              path: '/:one',
            },
            {
              action: action2,
              path: '/:two',
            },
          ],
          path: '/:one',
        },
      ]);
      const context = await resolver.resolve({ pathname: '/a/b' });
      expect(action1.calledTwice).to.be.true;
      expect(action1.firstCall.firstArg).to.have.property('params').that.deep.equals({ one: 'a' });
      expect(action1.args[1][0]).to.have.property('params').that.deep.equals({ one: 'b' });
      expect(action2.calledOnce).to.be.true;
      expect(action2.firstCall.firstArg).to.have.property('params').that.deep.equals({ one: 'a', two: 'b' });
      expect(context).to.be.true;
    });

    it('should not collect parameters from previous routes', async () => {
      const action1 = sinon.spy(() => undefined);
      const action2 = sinon.spy(() => undefined);
      const action3 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          action: action1,
          children: [
            {
              action: action1,
              path: '/:two',
            },
          ],
          path: '/:one',
        },
        {
          action: action2,
          children: [
            {
              action: action2,
              path: '/:four',
            },
            {
              action: action3,
              path: '/:five',
            },
          ],
          path: '/:three',
        },
      ]);
      const context = await resolver.resolve({ pathname: '/a/b' });
      expect(action1.calledTwice).to.be.true;
      expect(action1.firstCall.firstArg).to.have.property('params').that.deep.equals({ one: 'a' });
      expect(action1.secondCall.firstArg).to.have.property('params').that.deep.equals({ one: 'a', two: 'b' });
      expect(action2.calledTwice).to.be.true;
      expect(action2.firstCall.firstArg).to.have.property('params').that.deep.equals({ three: 'a' });
      expect(action2.secondCall.firstArg).to.have.property('params').that.deep.equals({ four: 'b', three: 'a' });
      expect(action3.calledOnce).to.be.true;
      expect(action3.firstCall.firstArg).to.have.property('params').that.deep.equals({ five: 'b', three: 'a' });
      expect(context).to.be.true;
    });

    it('should support next() across multiple routes', async () => {
      const log: number[] = [];
      const resolver = new Resolver([
        {
          async action({ next }) {
            log.push(1);
            const result = await next();
            log.push(10);
            return result;
          },
          children: [
            {
              action() {
                log.push(2);
              },
              children: [
                {
                  async action({ next }) {
                    log.push(3);
                    return next().then(() => {
                      log.push(6);
                    });
                  },
                  children: [
                    {
                      async action({ next }) {
                        log.push(4);
                        return next().then(() => {
                          log.push(5);
                        });
                      },
                      path: '',
                    },
                  ],
                  path: '',
                },
              ],
              path: '',
            },
            {
              action() {
                log.push(7);
              },
              children: [
                {
                  action() {
                    log.push(8);
                  },
                  path: '',
                },
                {
                  action() {
                    log.push(9);
                  },
                  path: '(.*)',
                },
              ],
              path: '',
            },
          ],
          path: '/test',
        },
        {
          action() {
            log.push(11);
          },
          path: '/:id',
        },
        {
          action() {
            log.push(12);
            return 'done';
          },
          path: '/test',
        },
        {
          action() {
            log.push(13);
          },
          path: '/*',
        },
      ]);

      const context = await resolver.resolve('/test');
      expect(log).to.be.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      expect(context).to.be.equal('done');
    });

    it('should support next(true) across multiple routes', async () => {
      const log: number[] = [];
      const resolver = new Resolver({
        async action({ next }) {
          log.push(1);
          return next().then((result) => {
            log.push(9);
            return result;
          });
        },
        children: [
          {
            async action({ next }) {
              log.push(2);
              return next(true).then((result) => {
                log.push(8);
                return result;
              });
            },
            path: '/a/b/c',
          },
          {
            action() {
              log.push(3);
            },
            children: [
              {
                async action({ next }) {
                  log.push(4);
                  return next().then((result) => {
                    log.push(6);
                    return result;
                  });
                },
                children: [
                  {
                    action() {
                      log.push(5);
                    },
                    path: '/c',
                  },
                ],
                path: '/b',
              },
              {
                action() {
                  log.push(7);
                  return 'done';
                },
                path: '/b/c',
              },
            ],
            path: '/a',
          },
        ],
      });

      const context = await resolver.resolve('/a/b/c');
      expect(log).to.be.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(context).to.be.equal('done');
    });

    it('should support parametrized routes 1', async () => {
      const action = sinon.spy(() => true);
      const resolver = new Resolver([{ action, path: '/path/:a/other/:b' }]);
      const context = await resolver.resolve('/path/1/other/2');
      expect(action.calledOnce).to.be.true;
      expect(action.firstCall.firstArg).to.have.nested.property('params.a', '1');
      expect(action.firstCall.firstArg).to.have.nested.property('params.b', '2');
      expect(action.firstCall.firstArg).to.have.nested.property('params.a', '1');
      expect(action.firstCall.firstArg).to.have.nested.property('params.b', '2');
      expect(context).to.be.true;
    });

    it('should support nested routes (1)', async () => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          action: action1,
          children: [
            {
              action: action2,
              path: '/a',
            },
          ],
          path: '',
        },
      ]);

      const context = await resolver.resolve('/a');
      expect(action1.calledOnce).to.be.true;
      expect(action1.firstCall.firstArg).to.have.nested.property('route.path', '');
      expect(action2.calledOnce).to.be.true;
      expect(action2.firstCall.firstArg).to.have.nested.property('route.path', '/a');
      expect(context).to.be.true;
    });

    it('should support nested routes (2)', async () => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          action: action1,
          children: [
            {
              action: action2,
              path: '/b',
            },
          ],
          path: '/a',
        },
      ]);

      const context = await resolver.resolve('/a/b');
      expect(action1.calledOnce).to.be.true;
      expect(action1.firstCall.firstArg).to.have.nested.property('route.path', '/a');
      expect(action2.calledOnce).to.be.true;
      expect(action2.firstCall.firstArg).to.have.nested.property('route.path', '/b');
      expect(context).to.be.true;
    });

    it('should support nested routes (3)', async () => {
      const action1 = sinon.spy(() => undefined);
      const action2 = sinon.spy(() => null);
      const action3 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          action: action1,
          children: [
            {
              action: action2,
              path: '/b',
            },
          ],
          path: '/a',
        },
        {
          action: action3,
          path: '/a/b',
        },
      ]);

      const context = await resolver.resolve('/a/b');
      expect(action1.calledOnce).to.be.true;
      expect(action1.firstCall.firstArg).to.have.nested.property('route.path', '/a');
      expect(action2.calledOnce).to.be.true;
      expect(action2.firstCall.firstArg).to.have.nested.property('route.path', '/b');
      expect(action3.calledOnce).to.be.true;
      expect(action3.firstCall.firstArg).to.have.nested.property('route.path', '/a/b');
      expect(context).to.be.true;
    });

    it('should support an empty array of children', async () => {
      const action = sinon.spy();
      const resolver = new Resolver([
        {
          action,
          children: [],
          path: '/a',
        },
      ]);

      await resolver.resolve('/a/b').catch(() => {});
      expect(action).to.have.been.calledOnce;
    });

    it('should re-throw an error', async () => {
      const error = new Error('test error');
      const resolver = new Resolver([
        {
          action() {
            throw error;
          },
          path: '/a',
        },
      ]);
      let err;
      try {
        await resolver.resolve('/a');
      } catch (e) {
        err = e;
      }
      expect(err).to.be.equal(error);
    });

    it('should respect baseUrl', async () => {
      const action = sinon.spy(() => 17);
      const routes = {
        children: [
          {
            children: [{ action, path: '/c' }],
            path: '/b',
          },
        ],
        path: '/a',
      };
      const resolver = new Resolver(routes, { baseUrl: '/base/' });
      const context = await resolver.resolve('/base/a/b/c');
      expect(action.calledOnce).to.be.true;
      expect(action.firstCall.firstArg).to.have.property('pathname', '/base/a/b/c');
      expect(action.firstCall.firstArg).to.have.nested.property('route.path', '/c');
      expect(action.firstCall.firstArg).to.have.property('route', routes.children[0].children[0]);
      expect(action.firstCall.firstArg).to.have.property('resolver', resolver);
      expect(context).to.be.equal(17);

      let err;
      try {
        await resolver.resolve('/a/b/c');
      } catch (e) {
        err = e;
      }
      expect(action.calledOnce).to.be.true;
      expect(err).to.be.an('error');
      expect(err)
        .to.have.property('message')
        .that.matches(/Page not found/u);
      expect(err).to.have.property('code').that.equals(404);
      expect(err).to.have.nested.property('context.pathname').that.equals('/a/b/c');
      expect(err).to.have.nested.property('context.path').that.equals(undefined);
      expect(err).to.have.nested.property('context.resolver').that.equals(resolver);
    });

    it('should match routes with trailing slashes', async () => {
      const resolver = new Resolver([
        { action: () => 'a', path: '/' },
        { action: () => 'b', path: '/page/' },
        {
          children: [
            { action: () => 'c', path: '/' },
            { action: () => 'd', path: '/page/' },
          ],
          path: '/child',
        },
      ]);
      expect(await resolver.resolve('/')).to.be.equal('a');
      expect(await resolver.resolve('/page/')).to.be.equal('b');
      expect(await resolver.resolve('/child/')).to.be.equal('c');
      expect(await resolver.resolve('/child/page/')).to.be.equal('d');
    });

    it('should skip nested routes when middleware route returns null', async () => {
      const middleware = sinon.spy(() => null);
      const action = sinon.spy(() => 'skipped');
      const resolver = new Resolver([
        {
          action: middleware,
          children: [{ action }],
          path: '/match',
        },
        {
          action: () => 404,
          path: '/match',
        },
      ]);

      const context = await resolver.resolve('/match');
      expect(context).to.be.equal(404);
      expect(action.called).to.be.false;
      expect(middleware.calledOnce).to.be.true;
    });

    it('should match nested routes when middleware route returns undefined', async () => {
      const middleware = sinon.spy(() => undefined);
      const action = sinon.spy(() => null);
      const resolver = new Resolver([
        {
          action: middleware,
          children: [{ action }],
          path: '/match',
        },
        {
          action: () => 404,
          path: '/match',
        },
      ]);

      const context = await resolver.resolve('/match');
      expect(context).to.be.equal(404);
      expect(action.calledOnce).to.be.true;
      expect(middleware.calledOnce).to.be.true;
    });
  });

  // describe('Resolver.__createUrl(path, base) hook', () => {
  //   it('should exist', () => {
  //     expect(Resolver.__createUrl).to.be.instanceof(Function);
  //   });
  //
  //   it('should return URL-like object', () => {
  //     const absolutePathUrl = Resolver.__createUrl('/absolute/', 'http://example.com/base/url');
  //     expect(absolutePathUrl).to.have.property('href', 'http://example.com/absolute/');
  //     expect(absolutePathUrl).to.have.property('origin', 'http://example.com');
  //     expect(absolutePathUrl).to.have.property('pathname', '/absolute/');
  //
  //     const relativePathUrl = Resolver.__createUrl('relative', 'http://example.com/base/url');
  //     expect(relativePathUrl).to.have.property('href', 'http://example.com/base/relative');
  //     expect(relativePathUrl).to.have.property('origin', 'http://example.com');
  //     expect(relativePathUrl).to.have.property('pathname', '/base/relative');
  //   });
  // });

  describe('resolver.__effectiveBaseUrl getter', () => {
    it('should return empty string by default', () => {
      expect(new Resolver([]).__effectiveBaseUrl).to.equal('');
    });

    it('should return full base when baseUrl is set', () => {
      expect(new Resolver([], { baseUrl: '/foo/' }).__effectiveBaseUrl).to.equal(`${location.origin}/foo/`);
    });

    it('should ignore everything after last slash', () => {
      expect(new Resolver([], { baseUrl: '/foo' }).__effectiveBaseUrl).to.equal(`${location.origin}/`);
      expect(new Resolver([], { baseUrl: '/foo/bar' }).__effectiveBaseUrl).to.equal(`${location.origin}/foo/`);
    });

    // it('should invoke Resolver.__createUrl(path, base) hook', () => {
    //   sinon.spy(Resolver, '__createUrl');
    //   try {
    //     new Resolver([], { baseUrl: '/foo/bar' }).__effectiveBaseUrl;
    //     expect(Resolver.__createUrl).to.be.calledWith('/foo/bar', document.baseURI || document.URL);
    //   } finally {
    //     Resolver.__createUrl.restore();
    //   }
    // });
  });

  describe('resolver.__normalizePathname(pathname) method', () => {
    it('should return unmodified pathname by default', () => {
      const resolver = new Resolver([]);
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('foo')).to.equal('foo');
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('/bar')).to.equal('/bar');
    });

    it('should undefined when pathname does not match baseUrl', () => {
      const resolver = new Resolver([], { baseUrl: '/foo/' });
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('/')).to.equal(undefined);
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('/bar')).to.equal(undefined);
    });

    it('should local path when pathname matches baseUrl', () => {
      const resolver = new Resolver([], { baseUrl: '/foo/' });
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('/foo/')).to.equal('');
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('/foo/bar')).to.equal('bar');
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('baz')).to.equal('baz');
    });

    it('should use __effectiveBaseUrl', () => {
      const resolver = new Resolver([], { baseUrl: '/foo/' });
      const stub = sinon.stub().returns(`${location.origin}/bar/`);
      Object.defineProperty(resolver, '__effectiveBaseUrl', { get: stub });
      // @ts-expect-error: testing private method
      expect(resolver.__normalizePathname('/bar/')).to.equal('');
      expect(stub).to.be.called;
    });

    // it('should invoke Resolver.__createUrl(url, base) hook', () => {
    //   const createUrlSpy = sinon.spy(Resolver, '__createUrl');
    //   try {
    //     // Absolute pathname: prepend origin
    //     new Resolver([], { baseUrl: '/foo/bar' })
    //       // @ts-expect-error: testing private method
    //       .__normalizePathname('/baz/');
    //     expect(createUrlSpy).to.be.calledWith(`${location.origin}/baz/`, `${location.origin}/foo/`);
    //
    //     createUrlSpy.resetHistory();
    //
    //     // Relative pathname: prepend dot path prefix
    //     new Resolver([], { baseUrl: '/foo/bar' })
    //       // @ts-expect-error: testing private method
    //       .__normalizePathname('baz');
    //     expect(createUrlSpy).to.be.calledWith('./baz', `${location.origin}/foo/`);
    //   } finally {
    //     createUrlSpy.restore();
    //   }
    // });
  });
});

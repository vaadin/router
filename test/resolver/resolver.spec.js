/**
 * Universal resolver (https://www.kriasoft.com/universal-resolver/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

(({Resolver}) => {

  describe('new Resolver(routes, options)', () => {
    it('should throw an error in case of invalid routes', async() => {
      expect(() => new Resolver()).to.throw(TypeError, /Invalid routes/);
      expect(() => new Resolver(12)).to.throw(TypeError, /Invalid routes/);
      expect(() => new Resolver(null)).to.throw(TypeError, /Invalid routes/);
    });

    it('should support custom resolve option for declarative routes', async() => {
      const resolveRoute = sinon.spy((context) => context.route.component || undefined);
      const action = sinon.spy();
      const resolver = new Resolver(
        {
          path: '/a',
          action,
          children: [
            {path: '/:b', component: null, action},
            {path: '/c', component: 'c', action},
            {path: '/d', component: 'd', action},
          ],
        },
        {resolveRoute},
      );
      const context = await resolver.resolve('/a/c');
      expect(resolveRoute.calledThrice).to.be.true;
      expect(action.called).to.be.false;
      expect(context.result).to.be.equal('c');
    });

    it('should support custom error handler option', async() => {
      const errorHandler = sinon.spy(() => 'result');
      const resolver = new Resolver([], {errorHandler});
      const context = await resolver.resolve('/');
      expect(context.result).to.be.equal('result');
      expect(errorHandler.calledOnce).to.be.true;
      const error = errorHandler.args[0][0];
      expect(error).to.be.an('error');
      expect(error.message).to.match(/Page not found/);
      expect(error.code).to.be.equal(404);
      expect(error.context.pathname).to.be.equal('/');
      expect(error.context.resolver).to.be.equal(resolver);
    });

    it('should handle route errors', async() => {
      const errorHandler = sinon.spy(() => 'result');
      const route = {
        path: '/',
        action: () => {
          throw new Error('custom');
        },
      };
      const resolver = new Resolver(route, {errorHandler});
      const context = await resolver.resolve('/');
      expect(context.result).to.be.equal('result');
      expect(errorHandler.calledOnce).to.be.true;
      const error = errorHandler.args[0][0];
      expect(error).to.be.an('error');
      expect(error.message).to.be.equal('custom');
      expect(error.code).to.be.equal(500);
      expect(error.context.pathname).to.be.equal('/');
      expect(error.context.resolver).to.be.equal(resolver);
      expect(error.context.route).to.be.equal(route);
    });
  });

  describe('routes getter / setter', () => {
    it('should have a getter for the routes config', () => {
      const router = new Resolver([]);
      const actual = router.getRoutes();
      expect(actual).to.be.an('array').that.is.empty;
    });

    it('should have a setter for the routes config', () => {
      const router = new Resolver([]);
      router.setRoutes([
        {path: '/', component: 'x-home-view'}
      ]);
      const actual = router.getRoutes();
      expect(actual).to.be.an('array').that.has.lengthOf(1);
      expect(actual[0]).to.have.property('path', '/');
      expect(actual[0]).to.have.property('component', 'x-home-view');
    });
  });

  describe('resolver.resolve({ pathname, ...context })', () => {
    it('should throw an error if no route found', async() => {
      const resolver = new Resolver([]);
      let err;
      try {
        await resolver.resolve('/');
      } catch (e) {
        err = e;
      }
      expect(err).to.be.an('error');
      expect(err.message).to.match(/Page not found/);
      expect(err.code).to.be.equal(404);
      expect(err.context.pathname).to.be.equal('/');
      expect(err.context.path).to.be.equal(undefined);
      expect(err.context.resolver).to.be.equal(resolver);
    });

    it('should execute the matching route\'s action method and return its result', async() => {
      const action = sinon.spy(() => 'b');
      const resolver = new Resolver({path: '/a', action});
      const context = await resolver.resolve('/a');
      expect(action.calledOnce).to.be.true;
      expect(action.args[0][0]).to.have.deep.property('route.path', '/a');
      expect(context.result).to.be.equal('b');
    });

    it('should find the first route whose action method !== undefined or null', async() => {
      const action1 = sinon.spy(() => undefined);
      const action2 = sinon.spy(() => null);
      const action3 = sinon.spy(() => 'c');
      const action4 = sinon.spy(() => 'd');
      const resolver = new Resolver([
        {path: '/a', action: action1},
        {path: '/a', action: action2},
        {path: '/a', action: action3},
        {path: '/a', action: action4},
      ]);
      const context = await resolver.resolve('/a');
      expect(context.result).to.be.equal('c');
      expect(action1.calledOnce).to.be.true;
      expect(action2.calledOnce).to.be.true;
      expect(action3.calledOnce).to.be.true;
      expect(action4.called).to.be.false;
    });

    it('should be able to pass context variables to action methods', async() => {
      const action = sinon.spy(() => true);
      const resolver = new Resolver([{path: '/a', action}]);
      const context = await resolver.resolve({pathname: '/a', test: 'b'});
      expect(action.calledOnce).to.be.true;
      expect(action.args[0][0]).to.have.deep.property('route.path', '/a');
      expect(action.args[0][0]).to.have.property('test', 'b');
      expect(context.result).to.be.true;
    });

    it('should not call action methods of routes that don\'t match the URL path', async() => {
      const action = sinon.spy();
      const resolver = new Resolver([{path: '/a', action}]);
      let err;
      try {
        await resolver.resolve('/b');
      } catch (e) {
        err = e;
      }
      expect(err).to.be.an('error');
      expect(err.message).to.match(/Page not found/);
      expect(err.code).to.be.equal(404);
      expect(action.called).to.be.false;
    });

    it('should support asynchronous route actions', async() => {
      const resolver = new Resolver([{path: '/a', action: async() => 'b'}]);
      const context = await resolver.resolve('/a');
      expect(context.result).to.be.equal('b');
    });

    it('URL parameters are captured and added to context.params', async() => {
      const action = sinon.spy(() => true);
      const resolver = new Resolver([{path: '/:one/:two', action}]);
      const context = await resolver.resolve({pathname: '/a/b'});
      expect(action.calledOnce).to.be.true;
      expect(action.args[0][0])
        .to.have.property('params')
        .that.deep.equals({one: 'a', two: 'b'});
      expect(context.result).to.be.true;
    });

    it('context.chain contains the path to the last matched route if context.next() is called', async() => {
      const resolver = new Resolver([
        {path: '/a', name: 'first', action: context => context.next()},
        {path: '/a', name: 'second', action: () => true},
      ]);
      const context = await resolver.resolve({pathname: '/a'});
      expect(context.chain).to.be.an('array').lengthOf(1);
      expect(context.chain[0].name).to.equal('second');
    });

    it('the path to the route that produced the result is in the `context` (1))', async() => {
      const resolver = new Resolver([{path: '/a/b', action: () => true}]);
      const context = await resolver.resolve({pathname: '/a/b'});
      expect(context.chain).to.be.an('array').lengthOf(1);
      expect(context.chain[0].path).to.equal('/a/b');
    });

    it('paths with parameters should have each route activated without parameters replaced', async() => {
      const resolver = new Resolver([
        {path: '/users/:user', action: () => 'x-user-profile'},
        {path: '/image-:size(\\d+)px', action: () => 'x-image-view'},
        {path: '/kb/:path+/:id', action: () => 'x-knowledge-base'},
      ]);

      let context;
      context = await resolver.resolve('/users/1');
      expect(context.chain).to.be.an('array').lengthOf(1);
      expect(context.chain[0].path).to.equal('/users/:user');

      context = await resolver.resolve('/image-15px');
      expect(context.chain).to.be.an('array').lengthOf(1);
      expect(context.chain[0].path).to.equal('/image-:size(\\d+)px');

      context = await resolver.resolve('/kb/folder/nested/1');
      expect(context.chain).to.be.an('array').lengthOf(1);
      expect(context.chain[0].path).to.equal('/kb/:path+/:id');
    });

    it('the path to the route that produced the result is in the `context` (2)', async() => {
      const resolver = new Resolver([
        {
          path: '/a',
          children: [
            {
              path: '/b',
              action: () => true,
            },
          ],
        },
      ]);
      const context = await resolver.resolve({pathname: '/a/b'});
      expect(context.chain).to.be.an('array').lengthOf(2);
      expect(context.chain[0].path).to.equal('/a');
      expect(context.chain[1].path).to.equal('/b');
    });

    it('the path to the route that produced the result is in the `context` (3)', async() => {
      const resolver = new Resolver([
        {
          path: '/',
          children: [
            {
              path: '',
              children: [
                {
                  path: '/a',
                  action: () => true,
                },
              ],
            },
          ],
        },
        {path: '/b', action: () => true},
      ]);
      const context = await resolver.resolve({pathname: '/b'});
      expect(context.chain).to.be.an('array').lengthOf(1);
      expect(context.chain[0].path).to.equal('/b');
    });

    it('should provide all URL parameters to each route', async() => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          path: '/:one',
          action: action1,
          children: [
            {
              path: '/:two',
              action: action2,
            },
          ],
        },
      ]);
      const context = await resolver.resolve({pathname: '/a/b'});
      expect(action1.calledOnce).to.be.true;
      expect(action1.args[0][0])
        .to.have.property('params')
        .that.deep.equals({one: 'a'});
      expect(action2.calledOnce).to.be.true;
      expect(action2.args[0][0])
        .to.have.property('params')
        .that.deep.equals({one: 'a', two: 'b'});
      expect(context.result).to.be.true;
    });

    it('should override URL parameters with same name in child route', async() => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          path: '/:one',
          action: action1,
          children: [
            {
              path: '/:one',
              action: action1,
            },
            {
              path: '/:two',
              action: action2,
            },
          ],
        },
      ]);
      const context = await resolver.resolve({pathname: '/a/b'});
      expect(action1.calledTwice).to.be.true;
      expect(action1.args[0][0])
        .to.have.property('params')
        .that.deep.equals({one: 'a'});
      expect(action1.args[1][0])
        .to.have.property('params')
        .that.deep.equals({one: 'b'});
      expect(action2.calledOnce).to.be.true;
      expect(action2.args[0][0])
        .to.have.property('params')
        .that.deep.equals({one: 'a', two: 'b'});
      expect(context.result).to.be.true;
    });

    it('should not collect parameters from previous routes', async() => {
      const action1 = sinon.spy(() => undefined);
      const action2 = sinon.spy(() => undefined);
      const action3 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          path: '/:one',
          action: action1,
          children: [
            {
              path: '/:two',
              action: action1,
            },
          ],
        },
        {
          path: '/:three',
          action: action2,
          children: [
            {
              path: '/:four',
              action: action2,
            },
            {
              path: '/:five',
              action: action3,
            },
          ],
        },
      ]);
      const context = await resolver.resolve({pathname: '/a/b'});
      expect(action1.calledTwice).to.be.true;
      expect(action1.args[0][0])
        .to.have.property('params')
        .that.deep.equals({one: 'a'});
      expect(action1.args[1][0])
        .to.have.property('params')
        .that.deep.equals({one: 'a', two: 'b'});
      expect(action2.calledTwice).to.be.true;
      expect(action2.args[0][0])
        .to.have.property('params')
        .that.deep.equals({three: 'a'});
      expect(action2.args[1][0])
        .to.have.property('params')
        .that.deep.equals({three: 'a', four: 'b'});
      expect(action3.calledOnce).to.be.true;
      expect(action3.args[0][0])
        .to.have.property('params')
        .that.deep.equals({three: 'a', five: 'b'});
      expect(context.result).to.be.true;
    });

    it('should support next() across multiple routes', async() => {
      const log = [];
      const resolver = new Resolver([
        {
          path: '/test',
          children: [
            {
              path: '',
              action() {
                log.push(2);
              },
              children: [
                {
                  path: '',
                  action({next}) {
                    log.push(3);
                    return next().then(() => {
                      log.push(6);
                    });
                  },
                  children: [
                    {
                      path: '',
                      action({next}) {
                        log.push(4);
                        return next().then(() => {
                          log.push(5);
                        });
                      },
                    },
                  ],
                },
              ],
            },
            {
              path: '',
              action() {
                log.push(7);
              },
              children: [
                {
                  path: '',
                  action() {
                    log.push(8);
                  },
                },
                {
                  path: '(.*)',
                  action() {
                    log.push(9);
                  },
                },
              ],
            },
          ],
          async action({next}) {
            log.push(1);
            const result = await next();
            log.push(10);
            return result;
          },
        },
        {
          path: '/:id',
          action() {
            log.push(11);
          },
        },
        {
          path: '/test',
          action() {
            log.push(12);
            return 'done';
          },
        },
        {
          path: '/*',
          action() {
            log.push(13);
          },
        },
      ]);

      const context = await resolver.resolve('/test');
      expect(log).to.be.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      expect(context.result).to.be.equal('done');
    });

    it('should support next(true) across multiple routes', async() => {
      const log = [];
      const resolver = new Resolver({
        action({next}) {
          log.push(1);
          return next().then((result) => {
            log.push(9);
            return result;
          });
        },
        children: [
          {
            path: '/a/b/c',
            action({next}) {
              log.push(2);
              return next(true).then((result) => {
                log.push(8);
                return result;
              });
            },
          },
          {
            path: '/a',
            action() {
              log.push(3);
            },
            children: [
              {
                path: '/b',
                action({next}) {
                  log.push(4);
                  return next().then((result) => {
                    log.push(6);
                    return result;
                  });
                },
                children: [
                  {
                    path: '/c',
                    action() {
                      log.push(5);
                    },
                  },
                ],
              },
              {
                path: '/b/c',
                action() {
                  log.push(7);
                  return 'done';
                },
              },
            ],
          },
        ],
      });

      const context = await resolver.resolve('/a/b/c');
      expect(log).to.be.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(context.result).to.be.equal('done');
    });

    it('should support parametrized routes 1', async() => {
      const action = sinon.spy(() => true);
      const resolver = new Resolver([{path: '/path/:a/other/:b', action}]);
      const context = await resolver.resolve('/path/1/other/2');
      expect(action.calledOnce).to.be.true;
      expect(action.args[0][0]).to.have.deep.property('params.a', '1');
      expect(action.args[0][0]).to.have.deep.property('params.b', '2');
      expect(action.args[0][0].params).to.have.property('a', '1');
      expect(action.args[0][0].params).to.have.property('b', '2');
      expect(context.result).to.be.true;
    });

    it('should support nested routes (1)', async() => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          path: '',
          action: action1,
          children: [
            {
              path: '/a',
              action: action2,
            },
          ],
        },
      ]);

      const context = await resolver.resolve('/a');
      expect(action1.calledOnce).to.be.true;
      expect(action1.args[0][0]).to.have.deep.property('route.path', '');
      expect(action2.calledOnce).to.be.true;
      expect(action2.args[0][0]).to.have.deep.property('route.path', '/a');
      expect(context.result).to.be.true;
    });

    it('should support nested routes (2)', async() => {
      const action1 = sinon.spy();
      const action2 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          path: '/a',
          action: action1,
          children: [
            {
              path: '/b',
              action: action2,
            },
          ],
        },
      ]);

      const context = await resolver.resolve('/a/b');
      expect(action1.calledOnce).to.be.true;
      expect(action1.args[0][0]).to.have.deep.property('route.path', '/a');
      expect(action2.calledOnce).to.be.true;
      expect(action2.args[0][0]).to.have.deep.property('route.path', '/b');
      expect(context.result).to.be.true;
    });

    it('should support nested routes (3)', async() => {
      const action1 = sinon.spy(() => undefined);
      const action2 = sinon.spy(() => null);
      const action3 = sinon.spy(() => true);
      const resolver = new Resolver([
        {
          path: '/a',
          action: action1,
          children: [
            {
              path: '/b',
              action: action2,
            },
          ],
        },
        {
          path: '/a/b',
          action: action3,
        },
      ]);

      const context = await resolver.resolve('/a/b');
      expect(action1.calledOnce).to.be.true;
      expect(action1.args[0][0]).to.have.deep.property('route.path', '/a');
      expect(action2.calledOnce).to.be.true;
      expect(action2.args[0][0]).to.have.deep.property('route.path', '/b');
      expect(action3.calledOnce).to.be.true;
      expect(action3.args[0][0]).to.have.deep.property('route.path', '/a/b');
      expect(context.result).to.be.true;
    });

    it('should re-throw an error', async() => {
      const error = new Error('test error');
      const resolver = new Resolver([
        {
          path: '/a',
          action() {
            throw error;
          },
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

    it('should respect baseUrl', async() => {
      const action = sinon.spy(() => 17);
      const routes = {
        path: '/a',
        children: [
          {
            path: '/b',
            children: [{path: '/c', action}],
          },
        ],
      };
      const resolver = new Resolver(routes, {baseUrl: '/base'});
      const context = await resolver.resolve('/base/a/b/c');
      expect(action.calledOnce).to.be.true;
      expect(action.args[0][0]).to.have.property('pathname', '/base/a/b/c');
      expect(action.args[0][0]).to.have.deep.property('route.path', '/c');
      expect(action.args[0][0]).to.have.property('route', routes.children[0].children[0]);
      expect(action.args[0][0]).to.have.property('resolver', resolver);
      expect(context.result).to.be.equal(17);

      let err;
      try {
        await resolver.resolve('/a/b/c');
      } catch (e) {
        err = e;
      }
      expect(action.calledOnce).to.be.true;
      expect(err).to.be.an('error');
      expect(err.message).to.match(/Page not found/);
      expect(err.code).to.be.equal(404);
      expect(err.context.pathname).to.be.equal('/a/b/c');
      expect(err.context.path).to.be.equal(undefined);
      expect(err.context.resolver).to.be.equal(resolver);
    });

    it('should match routes with trailing slashes', async() => {
      const resolver = new Resolver([
        {path: '/', action: () => 'a'},
        {path: '/page/', action: () => 'b'},
        {
          path: '/child',
          children: [
            {path: '/', action: () => 'c'},
            {path: '/page/', action: () => 'd'}
          ],
        },
      ]);
      expect((await resolver.resolve('/')).result).to.be.equal('a');
      expect((await resolver.resolve('/page/')).result).to.be.equal('b');
      expect((await resolver.resolve('/child/')).result).to.be.equal('c');
      expect((await resolver.resolve('/child/page/')).result).to.be.equal('d');
    });

    it('should skip nested routes when middleware route returns null', async() => {
      const middleware = sinon.spy(() => null);
      const action = sinon.spy(() => 'skipped');
      const resolver = new Resolver([
        {
          path: '/match',
          action: middleware,
          children: [{action}],
        },
        {
          path: '/match',
          action: () => 404,
        },
      ]);

      const context = await resolver.resolve('/match');
      expect(context.result).to.be.equal(404);
      expect(action.called).to.be.false;
      expect(middleware.calledOnce).to.be.true;
    });

    it('should match nested routes when middleware route returns undefined', async() => {
      const middleware = sinon.spy(() => undefined);
      const action = sinon.spy(() => null);
      const resolver = new Resolver([
        {
          path: '/match',
          action: middleware,
          children: [{action}],
        },
        {
          path: '/match',
          action: () => 404,
        },
      ]);

      const context = await resolver.resolve('/match');
      expect(context.result).to.be.equal(404);
      expect(action.calledOnce).to.be.true;
      expect(middleware.calledOnce).to.be.true;
    });
  });
})(window.VaadinTestNamespace || window.Vaadin);

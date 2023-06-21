/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { expect, use } from '@esm-bundle/chai';
import sinon from 'sinon';
import chaiDom from 'chai-dom';
import sinonChai from 'sinon-chai';
import generateUrls, { type UrlParams } from '../../src/resolver/generateUrls';
import Resolver from '../../src/resolver/resolver';

use(chaiDom);
use(sinonChai);

describe('generateUrls(router, options)(routeName, params)', () => {
  it('should throw an error in case of invalid router', async () => {
    // @ts-expect-error: checking for an error
    expect(() => generateUrls()).to.throw(TypeError, /An instance of Resolver is expected/);
    // @ts-expect-error: checking for an error
    expect(() => generateUrls([])).to.throw(TypeError, /An instance of Resolver is expected/);
    // @ts-expect-error: checking for an error
    expect(() => generateUrls(123)).to.throw(TypeError, /An instance of Resolver is expected/);
    // @ts-expect-error: checking for an error
    expect(() => generateUrls(null)).to.throw(TypeError, /An instance of Resolver is expected/);
    // @ts-expect-error: checking for an error
    expect(() => generateUrls(Resolver)).to.throw(TypeError, /An instance of Resolver is expected/);
  });

  it('should throw an error if no route found', async () => {
    const router = new Resolver({ action() {}, path: '/a', name: 'a' });
    const url = generateUrls(router);
    expect(() => url('hello')).to.throw(Error, /Route "hello" not found/);

    router.root.__children = [{ action() {}, path: '/b', name: 'new' }];
    expect(url('new')).to.be.equal('/a/b');
  });

  it('should throw an error if route name is not unique', async () => {
    const router = new Resolver([
      { action() {}, path: '/a', name: 'example' },
      { action() {}, path: '/b', name: 'example' },
    ]);
    const url = generateUrls(router);
    expect(() => url('example')).to.throw(Error, /Duplicate route with name "example"/);
  });

  it('should not throw an error for unique route name', async () => {
    const router = new Resolver([
      { action() {}, path: '/a', name: 'example' },
      { action() {}, path: '/b', name: 'example' },
      { action() {}, path: '/c', name: 'unique' },
    ]);
    const url = generateUrls(router);
    expect(() => url('unique')).to.not.throw();
  });

  it('should generate url for named routes', async () => {
    const router1 = new Resolver({ action() {}, path: '/:name', name: 'user' });
    const url1 = generateUrls(router1);
    expect(url1('user', { name: 'koistya' })).to.be.equal('/koistya');
    expect(() => url1('user')).to.throw(TypeError, /Expected "name" to be a string/);

    const router2 = new Resolver({ action() {}, path: '/user/:id', name: 'user' });
    const url2 = generateUrls(router2);
    expect(url2('user', { id: '123' })).to.be.equal('/user/123');
    expect(() => url2('user')).to.throw(TypeError, /Expected "id" to be a string/);

    const router3 = new Resolver({ action() {}, path: '/user/:id' });
    const url3 = generateUrls(router3);
    expect(() => url3('user')).to.throw(Error, /Route "user" not found/);
  });

  it('should generate urls for routes with array of paths', async () => {
    const router1 = new Resolver({ action() {}, path: ['/:name', '/user/:name'], name: 'user' });
    const url1 = generateUrls(router1);
    expect(url1('user', { name: 'koistya' })).to.be.equal('/koistya');

    const router2 = new Resolver({ action() {}, path: ['/user/:id', /\/user\/(\d+)/iu], name: 'user' });
    const url2 = generateUrls(router2);
    expect(url2('user', { id: '123' })).to.be.equal('/user/123');

    const router3 = new Resolver({ action() {}, path: [], name: 'user' });
    const url3 = generateUrls(router3);
    expect(url3('user')).to.be.equal('/');
  });

  it('should generate url for nested routes', async () => {
    const router = new Resolver({
      path: '',
      name: 'a',
      // @ts-expect-error: assigning to a private property
      __children: [
        {
          path: '/b/:x',
          name: 'b',
          __children: [
            { action() {}, path: '/c/:y', name: 'c' },
            { action() {}, path: '/d' },
            { action() {}, path: '/e' },
          ],
        },
      ],
    });
    const url = generateUrls(router);
    expect(url('a')).to.be.equal('/');
    expect(url('b', { x: '123' })).to.be.equal('/b/123');
    expect(url('c', { x: 'i', y: 'j' })).to.be.equal('/b/i/c/j');
    // TODO(platosha): Re-enable assergin `routesByName` when the API is exposed
    // // the .keys assertion does not work with ES6 Maps until chai 4.x
    // let routesByName = Array.from(router.routesByName.keys());
    // expect(routesByName).to.have.all.members(['a', 'b', 'c']);

    router.root.__children?.push({ action() {}, path: '/new', name: 'new' });
    expect(url('new')).to.be.equal('/new');
    // TODO(platosha): Re-enable assergin `routesByName` when the API is exposed
    // // the .keys assertion does not work with ES6 Maps until chai 4.x
    // routesByName = Array.from(router.routesByName.keys());
    // expect(routesByName).to.have.all.members(['a', 'b', 'c', 'new']);
  });

  it('should respect baseUrl', async () => {
    // NOTE(platosha): the baseUrl support is only available in Vaadin.Router,
    // the generateUrls method should return clean urls without the base then.

    const options = { baseUrl: '/base/' };

    const router1 = new Resolver({ action() {}, path: '', name: 'home' }, options);
    const url1 = generateUrls(router1);
    expect(url1('home')).to.be.equal('/');

    const router2 = new Resolver({ action() {}, path: '/post/:id', name: 'post' }, options);
    const url2 = generateUrls(router2);
    expect(url2('post', { id: '12', x: 'y' })).to.be.equal('/post/12');

    const router3 = new Resolver(
      {
        path: '',
        name: 'a',
        // @ts-expect-error: assigning to a private property
        __children: [
          {
            action() {},
            path: '',
            name: 'b',
          },
          {
            path: '/c/:x',
            name: 'c',
            __children: [
              {
                action() {},
                path: '/d/:y',
                name: 'd',
              },
            ],
          },
        ],
      },
      options,
    );
    const url3 = generateUrls(router3);
    expect(url3('a')).to.be.equal('/');
    expect(url3('b')).to.be.equal('/');
    expect(url3('c', { x: 'x' })).to.be.equal('/c/x');
    expect(url3('d', { x: 'x', y: 'y' })).to.be.equal('/c/x/d/y');

    router3.root.__children?.push({ action() {}, path: '/new', name: 'new' });
    expect(url3('new')).to.be.equal('/new');
  });

  it('should generate url with trailing slash', async () => {
    const routes = [
      { action() {}, name: 'a', path: '/' },
      {
        path: '/parent',
        children: [
          { action() {}, name: 'b', path: '/' },
          { action() {}, name: 'c', path: '/child/' },
        ],
      },
    ];

    const router = new Resolver(routes);
    const url = generateUrls(router);
    expect(url('a')).to.be.equal('/');
    expect(url('b')).to.be.equal('/parent/');
    expect(url('c')).to.be.equal('/parent/child/');

    // NOTE(platosha): the baseUrl support is only available in Vaadin.Router,
    // the generateUrls method should return clean urls without the base then.
    const baseRouter = new Resolver(routes, { baseUrl: '/base/' });
    const baseUrl = generateUrls(baseRouter);
    expect(baseUrl('a')).to.be.equal('/');
    expect(baseUrl('b')).to.be.equal('/parent/');
    expect(baseUrl('c')).to.be.equal('/parent/child/');
  });

  it('should encode params', async () => {
    const router = new Resolver({ action() {}, path: '/:user', name: 'user' });

    const url = generateUrls(router);
    const prettyUrl = generateUrls(router, {
      encode(str) {
        return encodeURI(str).replace(/[/?#]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
      },
    });

    expect(url('user', { user: '#$&+,/:;=?@' })).to.be.equal('/%23%24%26%2B%2C%2F%3A%3B%3D%3F%40');
    expect(prettyUrl('user', { user: '#$&+,/:;=?@' })).to.be.equal('/%23$&+,%2F:;=%3F@');
  });

  it('should stringify query params (1)', async () => {
    const router = new Resolver({ action() {}, path: '/:user', name: 'user' });
    const stringifyQueryParams = sinon.spy((_: UrlParams) => 'qs');

    const url = generateUrls(router, { stringifyQueryParams });

    expect(url('user', { user: 'tj', busy: '1' })).to.be.equal('/tj?qs');
    expect(stringifyQueryParams.calledOnce).to.be.true;
    expect(stringifyQueryParams.args[0][0]).to.be.deep.equal({ busy: '1' });
  });

  it('should stringify query params (2)', async () => {
    const router = new Resolver({ action() {}, path: '/user/:username', name: 'user' });
    const stringifyQueryParams = sinon.spy((_: UrlParams) => '');

    const url = generateUrls(router, { stringifyQueryParams });

    expect(url('user', { username: 'tj', busy: '1' })).to.be.equal('/user/tj');
    expect(stringifyQueryParams.calledOnce).to.be.true;
    expect(stringifyQueryParams.args[0][0]).to.be.deep.equal({ busy: '1' });
  });

  it('should stringify query params (3)', async () => {
    const router = new Resolver({ action() {}, path: '/me', name: 'me' });
    const stringifyQueryParams = sinon.spy((_: UrlParams) => '?x=i&y=j&z=k');

    const url = generateUrls(router, { stringifyQueryParams });

    expect(url('me', { x: 'i', y: 'j', z: 'k' })).to.be.equal('/me?x=i&y=j&z=k');
    expect(stringifyQueryParams.calledOnce).to.be.true;
    expect(stringifyQueryParams.args[0][0]).to.be.deep.equal({ x: 'i', y: 'j', z: 'k' });
  });
});

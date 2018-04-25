/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

(({matchPath}) => {

  describe('matchPath(routepath, path, exact)', () => {
    describe('negative matches (should return null)', () => {
      describe('the empty route ("")', () => {
        it('should not match anything but the empty path if _exact_', () => {
          expect(matchPath('', '/', true)).to.be.null;
          expect(matchPath('', '/a', true)).to.be.null;
          expect(matchPath('', 'a', true)).to.be.null;
        });
      });
  
      describe('the root route ("/")', () => {
        it('should not match the empty path', () => {
          const result = matchPath('/', '');
          expect(result).to.be.null;
        });
  
        it('should not match other absolute paths if _exact_', () => {
          const result = matchPath('/', '/a', true);
          expect(result).to.be.null;
        });
        
        it('should not match relative paths', () => {
          const result = matchPath('/', 'a');
          expect(result).to.be.null;
        });
      });
  
      describe('a non-root absolute route ("/a/b/c")', () => {
        it('should not match if the path and the route are completely different', () => {
          const result = matchPath('/a', 'x');
          expect(result).to.be.null;
        });
  
        it('should not match if the path is only a prefix of the route', () => {
          const result = matchPath('/a', '/');
          expect(result).to.be.null;
        });
  
        it('should not match if the route and the path have only a common segment', () => {
          const result = matchPath('/a/b', '/a/c');
          expect(result).to.be.null;
        });
  
        it('should not match if the route and the path have only a common prefix', () => {
          const result = matchPath('/a', '/ab');
          expect(result).to.be.null;
        });
  
        it('should not match if the route does have a trailing slash and the path does not', () => {
          const result = matchPath('/a/', '/a');
          expect(result).to.be.null;
        });
  
        describe('exact', () => {
          it('should not match if the route is only a prefix in a multi-segment path', () => {
            const result = matchPath('/a', '/a/b', true);
            expect(result).to.be.null;
          });
        });
      });
  
      describe('a non-empty relative route ("a/b/c")', () => {
        it('should not match if the path and the route are completely different', () => {
          const result = matchPath('aa', 'x');
          expect(result).to.be.null;
        });
  
        it('should not match if the path is only a prefix of the route', () => {
          const result = matchPath('aa', 'a');
          expect(result).to.be.null;
        });
  
        it('should not match if the route and the path have only a common segment', () => {
          const result = matchPath('a/b', 'a/c');
          expect(result).to.be.null;
        });
  
        it('should not match if the route and the path have only a common prefix', () => {
          const result = matchPath('a', 'ab');
          expect(result).to.be.null;
        });
  
        it('should not match if the route does have a trailing slash and the path does not', () => {
          const result = matchPath('a/', 'a');
          expect(result).to.be.null;
        });
  
        describe('exact', () => {
          it('should not match if the route is only a prefix in a multi-segment path', () => {
            const result = matchPath('a', 'a/b', true);
            expect(result).to.be.null;
          });
        });
      });
    });
  
    describe('positive matches (should return a match object)', () => {
      describe('the empty route ("")', () => {
        it('should match the empty path', () => {
          const result = matchPath('', '');
          expect(result).to.have.property('path', '');
        });
  
        it('should match the root path', () => {
          const result = matchPath('', '/');
          expect(result).to.have.property('path', '');
        });
  
        it('should match absolute paths', () => {
          const result = matchPath('', '/a');
          expect(result).to.have.property('path', '');
        });
  
        it('should match relative paths', () => {
          const result = matchPath('', 'a');
          expect(result).to.have.property('path', '');
        });
  
        it('should match multi-segment paths', () => {
          const result = matchPath('', 'a/b');
          expect(result).to.have.property('path', '');
        });
      });
  
      describe('the root route ("/")', () => {
        it('should match the root path', () => {
          const result = matchPath('/', '/');
          expect(result).to.have.property('path', '/');
        });
  
        it('should match simple absolute paths', () => {
          const result = matchPath('/', '/a');
          expect(result).to.have.property('path', '/');
        });
  
        it('should match multi-segment absolute paths', () => {
          const result = matchPath('/', '/a/b');
          expect(result).to.have.property('path', '/');
        });
      });
  
      describe('a non-root absolute route ("/a/b/c")', () => {
        it('should match if the route exactly matches the path', () => {
          const result = matchPath('/a', '/a');
          expect(result).to.have.property('path', '/a');
        });
  
        it('should match if the route is a prefix of the path', () => {
          const result = matchPath('/a', '/a/b');
          expect(result).to.have.property('path', '/a');
        });
  
        it('should match if the route does not have a trailing slash and the path does', () => {
          const result = matchPath('/a', '/a/');
          expect(result).to.have.property('path', '/a/');
        });
  
        it('should match if both the route and the path do have trailing slashes', () => {
          const result = matchPath('/a/', '/a/');
          expect(result).to.have.property('path', '/a/');
        });
      });
  
      describe('a non-empty relative route ("a/b/c")', () => {
        it('should match if the route exactly matches the path', () => {
          const result = matchPath('a', 'a');
          expect(result).to.have.property('path', 'a');
        });
  
        it('should match if the route is a prefix of the path', () => {
          const result = matchPath('a', 'a/b');
          expect(result).to.have.property('path', 'a');
        });
  
        it('should match if the route does not have a trailing slash and the path does', () => {
          const result = matchPath('a/b/c', 'a/b/c/');
          expect(result).to.have.property('path', 'a/b/c/');
        });
  
        it('should match if both the route and the path do have trailing slashes', () => {
          const result = matchPath('a/b/c/', 'a/b/c/');
          expect(result).to.have.property('path', 'a/b/c/');
        });
      });
    });
  
    describe('the match object', () => {
      it('should contain keys and params of the route if the route has some params', () => {
        const result = matchPath('/:a/:b', '/1/2');
        expect(result).to.be.ok;
        expect(result).to.have.property('path', '/1/2');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(2);
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({a: '1', b: '2'});
      });
  
      it('should contain empty keys and params if the route has no params', () => {
        const result = matchPath('', '');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(0);
        expect(result)
          .to.have.property('params')
          .and.be.an('object')
          .and.be.deep.equal({});
      });
  
      it('should preserve the provided keys and params if the route has no params', () => {
        const {keys, params} = matchPath('/:x', '/y');
        const result = matchPath('/a', '/a', false, keys, params);
        expect(result)
          .to.have.property('keys')
          .and.be.deep.equal(keys);
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal(params);
      });
  
      it('should amend the provided keys and params if the route has some params', () => {
        const {keys, params} = matchPath('/:x', '/y');
        const result = matchPath('/:a/:b?', '/1', false, keys, params);
        expect(result).to.have.property('path', '/1');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(3);
        expect(result.keys[0]).to.be.deep.equal(keys[0]);
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({x: 'y', a: '1', b: undefined});
      });
  
      it('should override the provided param value with the route param of the same name', () => {
        const {keys, params} = matchPath('/:b', '/0');
        const result = matchPath('/:a/:b?', '/1/2', false, keys, params);
        expect(result).to.have.property('path', '/1/2');
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({a: '1', b: '2'});
      });
  
      it('should not override the provided param value with undefined', () => {
        const {keys, params} = matchPath('/:b', '/0');
        const result = matchPath('/:a/:b?', '/1', false, keys, params);
        expect(result).to.have.property('path', '/1');
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({a: '1', b: '0'});
      });
  
      it.skip('should override the provided param key with the route param of the same name', () => {
        const {keys, params} = matchPath('/:b', '/0');
        const result = matchPath('/:a/:b?', '/1/2', false, keys, params);
        expect(result).to.have.property('path', '/1/2');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(2);
      });
  
      it.skip('should not override the provided param key with undefined', () => {
        const {keys, params} = matchPath('/:b', '/0');
        const result = matchPath('/:a/:b?', '/1', false, keys, params);
        expect(result).to.have.property('path', '/1');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(2);
        expect(result.keys[0]).to.be.deep.equal(keys[0]);
      });
    });
  
    describe('the route pattern', () => {
      it('should allow literal parenthesis', () => {
        const result = matchPath('/:user\\(:op\\)', '/tj(edit)');
        expect(result).to.have.property('path', '/tj(edit)');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(2);
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({user: 'tj', op: 'edit'});
      });
  
      it('should allow unnamed capturing groups', () => {
        const result1 = matchPath('/user(s)?/:user/:op', '/users/tj/edit');
        const result2 = matchPath('/user(s)?/:user/:op', '/user/tj/edit');
        
        expect(result1)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(3);
        expect(result1)
          .to.have.property('params')
          .and.be.deep.equal({0: 's', user: 'tj', op: 'edit'});
  
        expect(result2)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(3);
        expect(result2)
          .to.have.property('params')
          .and.be.deep.equal({0: undefined, user: 'tj', op: 'edit'});
      });
  
      it('should support repeat parameters (1)', () => {
        const result = matchPath('/:a*', '/1/2/3');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(1);
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({a: ['1', '2', '3']});
      });
  
      it('should support repeat parameters (2)', () => {
        const result = matchPath('/:a*', '/1');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(1);
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({a: ['1']});
      });
  
      it('should support repeat parameters (3)', () => {
        const result = matchPath('/:a*', '/');
        expect(result)
          .to.have.property('keys')
          .and.be.an('array')
          .lengthOf(1);
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({a: []});
      });
    });
  
    describe('params decoding', () => {
      it('should decode URI-encoded params correctly', () => {
        const result = matchPath('/:a/:b/:c', '/%2F/%3A/caf%C3%A9');
        expect(result)
          .to.have.property('params')
          .and.be.deep.equal({a: '/', b: ':', c: 'café'});
      });
  
      it('should not throw an error for malformed URI params', () => {
        const fn = () => matchPath('/:a', '/%AF');
        expect(fn).to.not.throw();
        expect(fn())
          .to.have.property('params')
          .and.be.deep.equal({a: '%AF'});
      });
  
      it('should decode repeat parameters correctly', () => {
        const fn = () => matchPath('/:a+', '/x%2Fy/z/%20/%AF');
        expect(fn).to.not.throw();
        expect(fn())
          .to.have.property('params')
          .and.be.deep.equal({a: ['x/y', 'z', ' ', '%AF']});
      });
    });
  
    describe.skip('array of paths', () => {
      it('should match to an array of paths', () => {
        const result = matchPath({path: ['/e', '/f']}, '/f');
        expect(result).to.be.deep.equal({path: '/f', keys: [], params: {}});
      });
  
      it('should not override existing param with undefined', () => {
        const fn = () => matchPath({path: ['/a/:c', '/b/:c']}, '/a/x');
        expect(fn).to.not.throw();
        expect(fn())
          .to.have.property('params')
          .and.be.deep.equal({c: 'x'});
      });
    });
  });
})(VaadinTestNamespace);
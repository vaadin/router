/**
 * Universal Router (https://www.kriasoft.com/universal-router/)
 *
 * Copyright (c) 2015-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable */
(({matchRoute}) => {

function toArray(gen) {
  const arr = []
  let res = gen.next()
  while (!res.done) {
    arr.push(res.value)
    res = gen.next()
  }
  return arr
}

describe('matchRoute(route, pathname)', () => {
  it('should return a valid iterator', () => {
    const route = {
      path: '/a',
    }
    const result = matchRoute(route, '/a')
    expect(result).to.be.an('object')
      .and.not.be.null
    expect(result).to.have.property('next')
      .that.is.a('function')
    
    const item = result.next();
    expect(item).to.have.property('done', false)
    expect(item).to.have.property('value')
      .that.is.an('object')
      .and.is.not.null
    
    const item2 = result.next()
    expect(item2).to.have.property('done', true)
  })

  it('should yield well-formed match objects', () => {
    const route = {
      path: '/a',
    }
    const match = matchRoute(route, '/a').next().value
    expect(match)
      .to.have.property('route')
      .that.is.an('object')
      .and.is.not.null
    expect(match)
      .to.have.property('keys')
      .that.is.an('array')
    expect(match)
      .to.have.property('params')
      .that.is.an('object')
      .and.is.not.null
  })

  describe('no matches', () => {
    it('should not match a route without children if it itself does not match', () => {
      const route = {
        path: '/a',
      }
      const result = toArray(matchRoute(route, '/b'))
      expect(result).to.have.lengthOf(0)
    })

    it('should not match an exact route with children if no children match', () => {
      const route = {
        path: '/a',
        exact: true,
        children: [
          { path: '/b' },
        ]
      }
      const result = toArray(matchRoute(route, '/a/c'))
      expect(result).to.have.lengthOf(0)
    })

    it('should not match a child route that would have matched if it was on the root level', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b' },
        ]
      }
      const result = toArray(matchRoute(route, '/b'))
      expect(result).to.have.lengthOf(0)
    })

    it('should not match a route sequence which--when literally joined--matches the path', () => {
      const route = {
        path: 'a',
        children: [
          { path: 'b' },
        ]
      }
      const result = toArray(matchRoute(route, 'ab'))
      expect(result).to.have.lengthOf(0)
    })
  })

  describe('matches the root of the routes tree', () => {
    it('should match a route without children', () => {
      const route = {
        path: '/a',
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/a')
    })

    it('should match a multi-segment route without children', () => {
      const route = {
        path: '/a/b',
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/a/b')
    })

    it('should match a route with one child', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/c'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/a')
    })

    it('should match a route with several children', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b' },
          { path: '/c' },
          { path: '/d' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/x'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/a')
    })

    it('should match a "" route with no children', () => {
      const route = {
        path: '',
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '')
    })

    it('should match a "" route with some children', () => {
      const route = {
        path: '',
        children: [
          { path: '/b' },
          { path: '/c' },
          { path: '/d' },
        ],
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '')
    })

    it('should match a "/" route with no children', () => {
      const route = {
        path: '/',
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/')
    })

    it('should match a "/" route with some children', () => {
      const route = {
        path: '/',
        children: [
          { path: '/b' },
          { path: '/c' },
          { path: '/d' },
        ],
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/')
    })

    it('should match a route with a trailing "/" and no children', () => {
      const route = {
        path: '/a/',
      }
      const result = toArray(matchRoute(route, '/a/'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/a/')
    })

    it('should match a route with a trailing "/" and some children - exact', () => {
      const route = {
        path: '/a/',
        children: [
          { path: '/b' },
          { path: '/c' },
          { path: '/d' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/a/')
    })

    it('should match a route with a trailing "/" and some children - prefix', () => {
      const route = {
        path: '/a/',
        children: [
          { path: '/b' },
          { path: '/c' },
          { path: '/d' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/x'))
      expect(result).to.have.lengthOf(1)
      // TODO(vlukashov): why /a/ would match the path '/a' (no trainling "/") and '/' would match the path '/'?
      expect(result[0]).to.have.deep.property('route.path', '/a/')
    })

    it('should match a route without a leading "/"', () => {
      const route = {
        path: 'a',
      }
      const result = toArray(matchRoute(route, 'a'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', 'a')
    })
  })

  describe('matches child routes', () => {
    it('should match both the parent and one child route (parent first) - single child', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a')
  
      expect(result[1]).to.have.deep.property('route.path', '/b')
    })
  
    it('should match both the parent and one child route (parent first) - several children', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b' },
          { path: '/c' },
          { path: '/d' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/d'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a')
  
      expect(result[1]).to.have.deep.property('route.path', '/d')
    })
  
    it('should match a child of an exact route but skip its exact parent', () => {
      const route = {
        path: '/a',
        exact: true,
        children: [
          { path: '/b' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/b')
    })

    it('should match child routes without the leading "/"', () => {
      const route = {
        path: '/a',
        children: [
          { path: 'b' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', 'b')
    })

    it('should match parent routes with a trailing "/" and child routes with a leading "/"', () => {
      const route = {
        path: '/a/',
        children: [
          { path: '/b' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a/')
      expect(result[1]).to.have.deep.property('route.path', '/b')
    })

    it('should match parent routes with a trailing "/" and child routes without a leading "/"', () => {
      const route = {
        path: '/a/',
        children: [
          { path: 'b' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a/')
      expect(result[1]).to.have.deep.property('route.path', 'b')
    })

    it('should match deep child routes without a leading "/"', () => {
      const route = {
        path: '/a',
        children: [
          {
            path: 'b',
            children: [
              { path: 'c' },
            ],
          },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b/c/d'))
      expect(result).to.have.lengthOf(3)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', 'b')
      expect(result[2]).to.have.deep.property('route.path', 'c')
    })

    it('should match child routes if the path has a trailing "/"', () => {
      const route = {
        path: '/a',
        children: [
          { path: 'b' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b/'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', 'b')
    })

    it('should match a parent "/" route', () => {
      const route = {
        path: '/',
        children: [
          { path: '/a' },
        ],
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/')
      expect(result[1]).to.have.deep.property('route.path', '/a')
    })

    it('should match a child "/" route', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', '/')
    })

    it('should match both the parent and the child "/" routes', () => {
      const route = {
        path: '/',
        name: 'parent',
        children: [
          { path: '/', name: 'child' },
        ],
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.name', 'parent')
      expect(result[1]).to.have.deep.property('route.name', 'child')
    })

    it('should match both a parent "" route and a child with a leading "/" if the path is absolute', () => {
      const route = {
        path: '',
        children: [
          { path: '/a' },
        ],
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '')
      expect(result[1]).to.have.deep.property('route.path', '/a')
    })

    it('should match only a parent "" route but not a child with a leading "/" if the path is relative', () => {
      const route = {
        path: '',
        children: [
          { path: '/a' },
        ],
      }
      const result = toArray(matchRoute(route, 'a'))
      expect(result).to.have.lengthOf(1)
    })

    it('should not match a deep child with a leading "/" if all parents are "" and the path is relative', () => {
      const route = {
        path: '',
        name: 'level-1',
        children: [
          {
            path: '',
            name: 'level-2',
            children: [
              { path: '/a' },
            ],
          },
        ],
      }
      const result = toArray(matchRoute(route, 'a'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.name', 'level-1')
      expect(result[1]).to.have.deep.property('route.name', 'level-2')
    })

    it('should match a deep child without a leading "/" if all parents are "" and the path is relative', () => {
      const route = {
        path: '',
        name: 'level-1',
        children: [
          {
            path: '',
            name: 'level-2',
            children: [
              { path: 'a' },
            ],
          },
        ],
      }
      const result = toArray(matchRoute(route, 'a'))
      expect(result).to.have.lengthOf(3)
      expect(result[0]).to.have.deep.property('route.name', 'level-1')
      expect(result[1]).to.have.deep.property('route.name', 'level-2')
      expect(result[2]).to.have.deep.property('route.path', 'a')
    })

    it('should match a child "" route', () => {
      const route = {
        path: '/a',
        children: [
          { path: '' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', '')
    })

    // this is an edge case which can be left undefined
    it.skip('should not match a child "" route if the parent route matches the path exactly', () => {
      const route = {
        path: '/a',
        children: [
          { path: '' },
        ],
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.deep.property('route.path', '/a')
    })

    // this is an edge case which can be left undefined
    it.skip('should match a child "" route if the parent has a trailing slash', () => {
      const route = {
        path: '/a/',
        children: [
          { path: '' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.path', '/a/')
      expect(result[1]).to.have.deep.property('route.path', '')
    })

    it('should match both the parent and the child "" routes', () => {
      const route = {
        path: '',
        name: 'parent',
        children: [
          { path: '', name: 'child' },
        ],
      }
      const result = toArray(matchRoute(route, '/a'))
      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.have.deep.property('route.name', 'parent')
      expect(result[1]).to.have.deep.property('route.name', 'child')
    })
  })

  describe('matches sibling routes', () => {
    it('should match all sibling routes in their definition order', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b' },
          { path: '/:id' }
        ],
      }
      const result = toArray(matchRoute(route, '/a/b'))
      expect(result).to.have.lengthOf(3)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', '/b')
      expect(result[2]).to.have.deep.property('route.path', '/:id')
    })

    it('should match both a multi-segment no-children route and a route with children', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b/c' },
          {
            path: '/b',
            children: [
              { path: '/c' },
            ],
          },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b/c'))
      expect(result).to.have.lengthOf(4)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', '/b/c')
      expect(result[2]).to.have.deep.property('route.path', '/b')
      expect(result[3]).to.have.deep.property('route.path', '/c')
    })

    it('should continue matching on the parent level after siblings are checked', () => {
      const route = {
        path: '/a',
        children: [
          {
            path: '/b',
            children: [
              { path: '/c' },
            ],
          },
          { path: '/b/c' },
        ],
      }
      const result = toArray(matchRoute(route, '/a/b/c'))
      expect(result).to.have.lengthOf(4)
      expect(result[0]).to.have.deep.property('route.path', '/a')
      expect(result[1]).to.have.deep.property('route.path', '/b')
      expect(result[2]).to.have.deep.property('route.path', '/c')
      expect(result[3]).to.have.deep.property('route.path', '/b/c')
    })
  })

  describe('keys and params in the match object', () => {
    it('should contain the keys and params of the matched route', () => {
      const route = {
        path: '/a/:b',
      }

      const result = toArray(matchRoute(route, '/a/1'))
      expect(result[0]).to.have.property('keys')
        .that.is.an('array')
        .and.is.lengthOf(1)
      expect(result[0]).to.have.property('params')
        .that.is.deep.equal({ b: '1' })
    })

    it('should contain the keys and params of the parent route', () => {
      const route = {
        path: '/a/:b',
        children: [
          { path: '/:c' },
        ],
      }

      const result = toArray(matchRoute(route, '/a/1/2'))
      expect(result[1]).to.have.property('keys')
        .that.is.an('array')
        .and.is.lengthOf(2)
      expect(result[1]).to.have.property('params')
        .that.is.deep.equal({ b: '1', c: '2' })
    })

    it('should be empty if neither the matched route nor its parents have any params', () => {
      const route = {
        path: '/a',
        children: [
          { path: '/b' },
        ],
      }

      const result = toArray(matchRoute(route, '/a/b'))
      expect(result[0]).to.have.property('keys')
        .that.is.an('array')
        .and.is.lengthOf(0)
      expect(result[0]).to.have.property('params')
        .that.is.deep.equal({})
      expect(result[1]).to.have.property('keys')
        .that.is.an('array')
        .and.is.lengthOf(0)
      expect(result[1]).to.have.property('params')
        .that.is.deep.equal({})
    })

    it('should not contain the keys and params of the child routes', () => {
      const route = {
        path: '/a/:b',
        children: [
          { path: '/:c' },
        ],
      }

      const result = toArray(matchRoute(route, '/a/1/2'))
      expect(result[0]).to.have.property('keys')
        .that.is.an('array')
        .and.is.lengthOf(1)
      expect(result[0]).to.have.property('params')
        .that.is.deep.equal({ b: '1' })
    })

    it('should not contain the keys and params of the sibling routes', () => {
      const route = {
        path: '/a/:b',
        children: [
          { path: '/:c' },
          { path: '/2' },
        ],
      }

      const result = toArray(matchRoute(route, '/a/1/2'))
      expect(result[2]).to.have.property('keys')
        .that.is.an('array')
        .and.is.lengthOf(1)
      expect(result[2]).to.have.property('params')
        .that.is.deep.equal({ b: '1' })
    })

    it('should override a parent route param value with that of a child route if the param names collide', () => {
      const route = {
        path: '/a/:b',
        children: [
          { path: '/:b' },
        ],
      }

      const result = toArray(matchRoute(route, '/a/1/2'))
      expect(result[1]).to.have.property('params')
        .that.is.deep.equal({ b: '2' })
    })

    it('should not override a parent route param value with `undefined` (for an optional child param)', () => {
      const route = {
        path: '/a/:b',
        children: [
          { path: '/:b?' },
        ],
      }

      const result = toArray(matchRoute(route, '/a/1'))
      expect(result[1]).to.have.property('params')
        .that.is.deep.equal({ b: '1' })
    })

    it('should not override a parent route param value in the parent match', () => {
      const route = {
        path: '/a/:b',
        children: [
          { path: '/:b' },
        ],
      }

      const result = toArray(matchRoute(route, '/a/1'))
      expect(result[0]).to.have.property('params')
        .that.is.deep.equal({ b: '1' })
    })
  })
})
})(VaadinTestNamespace);
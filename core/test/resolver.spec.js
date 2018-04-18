describe('Vaadin.Resolver', () => {
  it('should have a no-arg constructor', () => {
    const router = new Vaadin.Resolver();
    expect(router).to.be.ok;
  });

  it('should have a setter for the routes config', () => {
    const router = new Vaadin.Resolver();
    router.setRoutes([
      {path: '/', exact: true, component: 'x-home-view'},
      {path: '/users', component: 'x-users-view'}
    ]);
    expect(router).to.be.ok;
  });

  describe('setRoutes()', () => {
    let resolver;
    beforeEach(() => {
      resolver = new Vaadin.Resolver();
    });
    
    it('should accept an empty routes config (null, undefined, [])', () => {
      expect(() => resolver.setRoutes()).to.not.throw();
      expect(() => resolver.setRoutes(null)).to.not.throw();
      expect(() => resolver.setRoutes([])).to.not.throw();
    });

    it('should throw if a route object is not an object', () => {
      expect(() => resolver.setRoutes([undefined])).to.throw();
      expect(() => resolver.setRoutes([null])).to.throw();
      expect(() => resolver.setRoutes([true])).to.throw();
      expect(() => resolver.setRoutes(['not-an-object'])).to.throw();
      expect(() => resolver.setRoutes([42])).to.throw();
      expect(() => resolver.setRoutes([() => {}])).to.throw();
      expect(() => resolver.setRoutes([[]])).to.throw();
    });

    it('should throw if a route object does not have a `path` string property', () => {
      expect(() => resolver.setRoutes([{notAPath: ''}])).to.throw();
      expect(() => resolver.setRoutes([{path: null}])).to.throw();
    });

    it('should accept a route object with undocumented extra properties', () => {
      expect(() => resolver.setRoutes([
        {path: '/', aCustomUserDefinedProperty: 42}
      ])).to.not.throw();
    });
  });

  describe('resolve()', () => {
    let resolver;
    beforeEach(() => {
      resolver = new Vaadin.Resolver();
    });
    
    it('should return a promise that gets resolved when the resolve pass is completed with a match', async () => {
      resolver.setRoutes([{path: '/', action: () => 'x-home-view'}]);
      const result = resolver.resolve('/');
      expect(result).to.be.a('promise');
      const actual = await result;
      expect(actual).to.equal('x-home-view');
    });

    it('should return a promise that gets rejected when the resolve pass is completed with a no-match', (done) => {
      resolver.setRoutes();
      const result = resolver.resolve('/');
      result.then(() => {
        fail('the resolve() promise should get rejected');
      })
      .catch(() => done());
    });

    it('should use prefix matching by default', async () => {
      resolver.setRoutes([{path: '/users', action: () => 'x-home-view'}]);
      const actual = await resolver.resolve('/users/and/some/more/segments');
      expect(actual).to.equal('x-users-view');
    });

    it('should use exact matching if a path has the `exact` property', async () => {
      resolver.setRoutes([
        {path: '/users', exact: true, action: () => 'x-home-view'},
        {path: '/', action: () => 'x-not-found-view'},
      ]);
      const actual = await resolver.resolve('/users/and/some/more/segments');
      expect(actual).to.equal('x-not-found-view');
    });

    it('should use prefix matching if a path has the `exact` property but it is `false`', async () => {
      resolver.setRoutes([
        {path: '/users', exact: false, action: () => 'x-home-view'},
        {path: '/', action: () => 'x-not-found-view'},
      ]);
      const actual = await resolver.resolve('/users/and/some/more/segments');
      expect(actual).to.equal('x-users-view');
    });
  });
});
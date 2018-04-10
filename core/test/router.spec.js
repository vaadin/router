describe('Vaadin.Router', () => {
  describe('router outlet (basic functionality)', () => {

    let router;
    let routes;
    beforeEach(() => {
      router = new Vaadin.Router();
      routes = [
        {path: '/', component: 'x-home-view'},
        {path: '/users', component: 'x-users-view'}
      ];
    });

    it('should have a no-arg constructor', () => {
      expect(router).to.be.ok;
    });

    it('should have a setter for the routes config', () => {
      router.setRoutes([
        {path: '/', component: 'x-home-view'},
        {path: '/users', component: 'x-users-view'}
      ]);
      expect(router).to.be.ok;
    });

    it('should have a getter for the routes config', () => {
      router.setRoutes(routes);
      const actual = router.getRoutes();
      expect(actual).to.be.eql(routes);
    });

    it('should have a constructor accepting routes', () => {
      const router = new Vaadin.Router(routes);
      const actual = router.getRoutes();
      expect(actual).to.be.eql(routes);
    });
  });
});
(({POPSTATE}) => {
  describe('NavigationTriggers.POPSTATE', () => {
    let pathname;
    before(() => {
      pathname = window.location.pathname;
    });

    after(() => {
      window.history.pushState(null, null, pathname);
    });

    it('should expose the NavigationTrigger API', () => {
      expect(POPSTATE).to.have.property('activate').that.is.a('function');
      expect(POPSTATE).to.have.property('inactivate').that.is.a('function');
    });

    it('should translate `popstate` events into `vaadin-router:navigate` when activated', () => {
      POPSTATE.inactivate();
      const spy = sinon.spy();
      window.addEventListener('vaadin-router:navigate', spy);
      POPSTATE.activate();
      window.history.pushState(null, null, '/test-url');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.removeEventListener('vaadin-router:navigate', spy);
      expect(spy).to.have.been.called.once;
      expect(spy.args[0][0]).to.have.property('type', 'vaadin-router:navigate');
      expect(spy.args[0][0]).to.have.deep.property('detail.pathname', '/test-url');
    });

    it('should ignore `popstate` events with the `vaadin-router:ignore` state', () => {
      POPSTATE.inactivate();
      const spy = sinon.spy();
      window.addEventListener('vaadin-router:navigate', spy);
      POPSTATE.activate();
      window.history.pushState(null, null, '/test-url');
      window.dispatchEvent(new PopStateEvent('popstate', {state: 'vaadin-router:ignore'}));
      window.removeEventListener('vaadin-router:navigate', spy);
      expect(spy).to.not.have.been.called;
    });

    it('should not translate `popstate` events into `vaadin-router:navigate` when inactivated', () => {
      POPSTATE.activate();
      POPSTATE.inactivate();
      const spy = sinon.spy();
      window.addEventListener('vaadin-router:navigate', spy);
      window.history.pushState(null, null, '/test-url');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.removeEventListener('vaadin-router:navigate', spy);
      expect(spy).to.not.have.been.called;
    });
  });
})(VaadinTestNamespace);
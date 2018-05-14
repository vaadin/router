(({triggerNavigation}) => {
  describe('triggerNavigation', () => {
    it('should trigger a `vaadin-router:navigate` event on the `window`', () => {
      const spy = sinon.spy();
      window.addEventListener('vaadin-router:navigate', spy);
      triggerNavigation('');
      window.removeEventListener('vaadin-router:navigate', spy);
      expect(spy).to.have.been.called.once;
      expect(spy.args[0][0]).to.have.property('type', 'vaadin-router:navigate');
    });

    it('should pass the given pathname in the `detail.pathname` property of the triggered event', () => {
      const spy = sinon.spy();
      window.addEventListener('vaadin-router:navigate', spy);
      triggerNavigation('/a');
      window.removeEventListener('vaadin-router:navigate', spy);
      expect(spy).to.have.been.called.once;
      expect(spy.args[0][0]).to.have.deep.property('detail.pathname', '/a');
    });
  });
})(VaadinTestNamespace);
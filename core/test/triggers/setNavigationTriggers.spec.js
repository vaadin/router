(({setNavigationTriggers}) => {
  describe('setNavigationTriggers', () => {
    function createTriggerMock() {
      return {
        activate: sinon.spy(),
        inactivate: sinon.spy()
      };
    }

    it('should activate the given navigation trigger (if single)', () => {
      const trigger = createTriggerMock();
      setNavigationTriggers([trigger]);
      expect(trigger.activate).to.have.been.called.once;
      expect(trigger.inactivate).to.not.have.been.called;
    });

    it('should activate each given navigation trigger (if multiple)', () => {
      const trigger1 = createTriggerMock();
      const trigger2 = createTriggerMock();
      setNavigationTriggers([trigger1, trigger2]);
      expect(trigger1.activate).to.have.been.called.once;
      expect(trigger1.inactivate).to.not.have.been.called;
      expect(trigger2.activate).to.have.been.called.once;
      expect(trigger2.inactivate).to.not.have.been.called;
    });

    it('should not crash if no triggers are given', () => {
      expect(() => setNavigationTriggers([])).to.not.throw;
      expect(() => setNavigationTriggers()).to.not.throw;
    });

    it('should inactivate a previously given navigation trigger if it\'s not present in a repeat call', () => {
      const trigger1 = createTriggerMock();
      const trigger2 = createTriggerMock();
      setNavigationTriggers([trigger1]);
      setNavigationTriggers([trigger2]);
      expect(trigger1.inactivate).to.have.been.called.once;
    });
  });
})(VaadinTestNamespace);
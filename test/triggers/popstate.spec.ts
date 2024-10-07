import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import POPSTATE from '../../src/triggers/popstate.js';

describe('NavigationTriggers.POPSTATE', () => {
  before(() => {
    window.history.pushState(null, '', '/');
  });

  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  after(() => {
    window.history.back();
  });

  it('should expose the NavigationTrigger API', () => {
    expect(POPSTATE).to.have.property('activate').that.is.a('function');
    expect(POPSTATE).to.have.property('inactivate').that.is.a('function');
  });

  it('should translate `popstate` events into `vaadin-router-go` when activated', () => {
    POPSTATE.inactivate();
    const spy = sinon.spy();
    window.addEventListener('vaadin-router-go', spy);
    POPSTATE.activate();
    window.history.replaceState(null, '', '/test-url?search#hash');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.removeEventListener('vaadin-router-go', spy);
    expect(spy).to.have.been.calledOnce;
    expect(spy.args[0][0]).to.have.property('type', 'vaadin-router-go');
    expect(spy.args[0][0]).to.have.nested.property('detail.pathname');
    expect(spy.args[0][0]).to.have.nested.property('detail.search');
    expect(spy.args[0][0]).to.have.nested.property('detail.hash');
    // FIXME: assert values also
    // expect(spy.args[0][0]).to.have.nested.property('detail.pathname', '/test-url');
    // expect(spy.args[0][0]).to.have.nested.property('detail.search', '?search');
    // expect(spy.args[0][0]).to.have.nested.property('detail.hash', '#hash');
    sinon.restore();
  });

  it('should ignore `popstate` events with the `vaadin-router-ignore` state', () => {
    POPSTATE.inactivate();
    const spy = sinon.spy();
    window.addEventListener('vaadin-router-go', spy);
    POPSTATE.activate();
    window.history.replaceState(null, '', '/test-url');
    window.dispatchEvent(new PopStateEvent('popstate', { state: 'vaadin-router-ignore' }));
    window.removeEventListener('vaadin-router-go', spy);
    expect(spy).to.not.have.been.called;
  });

  it('should not translate `popstate` events into `vaadin-router-go` when inactivated', () => {
    POPSTATE.activate();
    POPSTATE.inactivate();
    const spy = sinon.spy();
    window.addEventListener('vaadin-router-go', spy);
    window.history.replaceState(null, '', '/test-url');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.removeEventListener('vaadin-router-go', spy);
    expect(spy).to.not.have.been.called;
  });
});

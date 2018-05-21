import triggerNavigation from './triggerNavigation.js';

// PopStateEvent constructor shim
const isIE = /Trident/.test(navigator.userAgent);

if (isIE && typeof window.PopStateEvent !== 'function') {
  window.PopStateEvent = function(inType, params) {
    params = params || {};
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
    return e;
  };
  window.PopStateEvent.prototype = window.Event.prototype;
}

function vaadinRouterGlobalPopstateHandler(event) {
  triggerNavigation(window.location.pathname, event);
}

/**
 * A navigation trigger for Vaadin.Router that translates popstate events into
 * Vaadin.Router navigation events.
 *
 * @memberOf Vaadin.Router.Triggers
 * @type {NavigationTrigger}
 */
const POPSTATE = {
  activate() {
    window.addEventListener('popstate', vaadinRouterGlobalPopstateHandler);
  },

  inactivate() {
    window.removeEventListener('popstate', vaadinRouterGlobalPopstateHandler);
  }
};

export default POPSTATE;

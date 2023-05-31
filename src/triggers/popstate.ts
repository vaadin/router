import {fireRouterEvent, isFunction} from '../utils.js';
import type {NavigationTrigger} from "./setNavigationTriggers";

// PopStateEvent constructor shim
const isIE = /Trident/.test(navigator.userAgent);

/* istanbul ignore next: coverage is calculated in Chrome, this code is for IE */
if (isIE && !isFunction(window['PopStateEvent'])) {
  window['PopStateEvent'] = function(inType: string, params?: PopStateEventInit) {
    params = params || {};
    const e = document.createEvent('Event');
    e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
    e['state'] = params.state || null;
    return e;
  } as typeof PopStateEvent;
  window['PopStateEvent'].prototype = window['Event'].prototype;
}

function vaadinRouterGlobalPopstateHandler(event) {
  if (event.state === 'vaadin-router-ignore') {
    return;
  }
  const {pathname, search, hash} = window.location;
  fireRouterEvent('go', {pathname, search, hash});
}

/**
 * A navigation trigger for Vaadin Router that translates popstate events into
 * Vaadin Router navigation events.
 */
const POPSTATE: NavigationTrigger = {
  activate() {
    window.addEventListener('popstate', vaadinRouterGlobalPopstateHandler);
  },

  inactivate() {
    window.removeEventListener('popstate', vaadinRouterGlobalPopstateHandler);
  }
};

export default POPSTATE;

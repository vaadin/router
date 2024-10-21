import { fireRouterEvent } from '../utils.js';
import type { NavigationTrigger } from './types.js';

function vaadinRouterGlobalPopstateHandler(event: PopStateEvent) {
  if (event.state === 'vaadin-router-ignore') {
    return;
  }

  fireRouterEvent('go', new URL(window.location.href));
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
  },
};

export default POPSTATE;

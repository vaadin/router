import { fireRouterEvent } from '../routerUtils.js';
import type { NavigationTrigger } from '../types.js';

function vaadinRouterGlobalPopstateHandler(event: PopStateEvent) {
  if (event.state === 'vaadin-router-ignore') {
    return;
  }
  const { hash, pathname, search } = window.location;
  fireRouterEvent('go', { hash, pathname, search });
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

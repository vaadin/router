import triggerNavigation from './triggerNavigation.js';

function vaadinRouterGlobalPopstateHandler() {
  triggerNavigation(window.location.pathname);
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
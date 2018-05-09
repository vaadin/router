// eslint-disable-next-line no-unused-vars
import {triggerNavigation} from './triggerNavigation.js';

function vaadinRouterGlobalClickHandler(event) {
  // TODO (vlukashov): implement vaadinRouterGlobalClickHandler()
}

/**
 * A navigation trigger for Vaadin.Router that translated clicks on `<a>` links
 * into Vaadin.Router navigation events.
 * 
 * Only regular clicks on in-app links are translated (primary mouse button, no
 * modifier keys, the target href is within the app's URL space).
 * 
 * @memberOf Vaadin.Router.Triggers
 * @type {NavigationTrigger}
 */
export const CLICK = {
  activate() {
    window.document.addEventListener('click', vaadinRouterGlobalClickHandler);
  },

  inactivate() {
    window.document.removeEventListener('click', vaadinRouterGlobalClickHandler);
  }
};

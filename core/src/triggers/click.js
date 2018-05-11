import triggerNavigation from './triggerNavigation.js';

function vaadinRouterGlobalClickHandler(event) {
  if (event.defaultPrevented) {
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  let anchor = event.target;
  const path = event.composedPath
    ? event.composedPath()
    : (event.path || []);
  for (const target of path) {
    if (target.nodeName && target.nodeName.toLowerCase() === 'a') {
      anchor = target;
      break;
    }
  }
  
  while (anchor && anchor.nodeName.toLowerCase() !== 'a') {
    anchor = anchor.parentNode;
  }

  if (!anchor || anchor.nodeName.toLowerCase() !== 'a') {
    return;
  }

  if (anchor.target && anchor.target.toLowerCase() !== '_self') {
    return;
  }

  if (anchor.hasAttribute('download')) {
    return;
  }

  if (!anchor.href.startsWith(document.baseURI)) {
    return;
  }

  if (anchor.pathname === window.location.pathname && anchor.hash !== '') {
    return;
  }

  event.preventDefault();
  triggerNavigation(anchor.pathname);
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
const CLICK = {
  activate() {
    window.document.addEventListener('click', vaadinRouterGlobalClickHandler);
  },

  inactivate() {
    window.document.removeEventListener('click', vaadinRouterGlobalClickHandler);
  }
};

export default CLICK;
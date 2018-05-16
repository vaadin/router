/**
 * Creates and dispatches a new `vaadin-router:navigate` event on the given
 * context (`window` by default). That triggers Vaadin.Router navigation to the
 * given path.
 * 
 * @param {!string} pathname a new pathname
 */
export default function triggerNavigation(pathname) {
  window.dispatchEvent(
    new CustomEvent(
      'vaadin-router:navigate',
      {
        detail: {pathname},
        cancelable: true
      }
    ));
}

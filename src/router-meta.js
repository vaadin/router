// NOTE(web-padawan): Have to use an awkward IIFE returning class here
// to prevent this class from showing up in analysis.json & API docs.
/** @private */
const VaadinRouterMeta = (() => class extends HTMLElement {
  static get is() {
    return 'vaadin-router-meta';
  }

  static get version() {
    return '0.3.0';
  }
})();

customElements.define(VaadinRouterMeta.is, VaadinRouterMeta);

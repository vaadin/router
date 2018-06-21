/**
 * The custom element class containing Router meta information,
 * considered as a read-only part of the public API.
 *
 * @class VaadinRouterMeta
 */
class VaadinRouterMeta extends HTMLElement {
  static get is() {
    return 'vaadin-router-meta';
  }

  static get version() {
    return '0.3.0';
  }
}

customElements.define(VaadinRouterMeta.is, VaadinRouterMeta);

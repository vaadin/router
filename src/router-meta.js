import {usageStatistics} from '@vaadin/vaadin-usage-statistics/vaadin-usage-statistics.js';

// NOTE(web-padawan): Have to use an awkward IIFE returning class here
// to prevent this class from showing up in analysis.json & API docs.
/** @private */
const VaadinRouterMeta = (() => class extends HTMLElement {
  static get is() {
    return 'vaadin-router-meta';
  }

  static get version() {
    return '1.0.0-rc.1';
  }
})();

customElements.define(VaadinRouterMeta.is, VaadinRouterMeta);
usageStatistics();

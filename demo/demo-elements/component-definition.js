(() => {
  class XBundleTestView extends Polymer.Element {
    static get template() {
      return Polymer.html`<h1>Hello from js bundle!</h1>`;
    }
  }

  customElements.define('x-bundle-test-view', XBundleTestView);
})();

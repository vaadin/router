(() => {
  class XBundleTestView extends Polymer.Element {
    static get is() {
      return 'x-bundle-test-view';
    }

    static get properties() {
      return {
        bundleScriptTestVariable: {
          type: String,
          value: 'Hello from js bundle!'
        }
      };
    }
  }

  customElements.define(XBundleTestView.is, XBundleTestView);
})();

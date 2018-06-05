(() => {
  class XUserJsBundleView extends Polymer.Element {
    static get is() {
      return 'x-user-js-bundle-view';
    }
    static get template() {
      return Polymer.html`
        <h1>User Profile</h1>
        <p>User id: <b>[[route.params.id]]</b>. This view was loaded using JS bundle.</p>
      `;
    }
  }

  customElements.define(XUserJsBundleView.is, XUserJsBundleView);
})();

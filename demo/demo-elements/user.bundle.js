(() => {
  class XUSerJsBundleView extends Polymer.Element {
    static get template() {
      return Polymer.html`
        <h1>User Profile</h1>
        <p>User id: <b>[[route.params.id]]</b>. This view was loaded using JS bundle.</p>
      `;
    }
  }

  customElements.define('x-user-js-bundle-view', XUSerJsBundleView);
})();

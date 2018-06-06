(() => {
  class XUserJsBundleView extends Polymer.Element {
    static get is() {
      return 'x-user-js-bundle-view';
    }
    static get template() {
      const tpl = document.createElement('template');
      tpl.innerHTML = `
        <h1>User Profile</h1>
        <p>User id: <b>[[route.params.id]]</b>. This view was loaded using JS bundle.</p>
      `;
      return tpl;
    }
  }

  customElements.define(XUserJsBundleView.is, XUserJsBundleView);
})();

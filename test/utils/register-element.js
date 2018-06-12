window.registerElement = function(element, template, props = {}) {
  const tpl = document.createElement('template');
  tpl.innerHTML = template;
  window.ShadyCSS && window.ShadyCSS.prepareTemplate(tpl, element);

  const ElementClass = class extends HTMLElement {
    connectedCallback() {
      window.ShadyCSS && window.ShadyCSS.styleElement(this);
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(document.importNode(tpl.content, true));
    }
  };

  for (var prop in props) {
    ElementClass.prototype[prop] = props[prop];
  }

  customElements.define(element, ElementClass);
};

import { expect } from "@esm-bundle/chai";
import sinon from "sinon";
import animate from "../../src/transitions/animate.js";
import '../setup.js';

describe('animate', function() {
  // eslint-disable-next-line no-invalid-this
  this.title = this.title + (window.ShadyDOM ? ' (Shady DOM)' : '');

  let target;

  function registerElement(element, template, props = {}) {
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

    customElements.define(element, ElementClass);
  }

  function attach(element) {
    target = document.createElement(element);
    document.body.appendChild(target);
  }

  afterEach(() => {
    document.body.removeChild(target);
  });

  it('should wait for animation if CSS is applied to `animating` attribute', async() => {
    const element = 'x-fade-out';
    const className = 'animating';

    registerElement(element, `
          <style>
            @keyframes fadeOut {
              from {
                opacity: 1;
              }
              to {
                opacity: 0;
              }
            }
            :host(.${className}) {
              animation: 50ms fadeOut;
            }
          </style>
        `);

    attach(element);
    const spy = sinon.spy();
    target.addEventListener('animationend', spy);

    await animate(target, className);
    expect(spy).to.be.calledOnce;
  });
});

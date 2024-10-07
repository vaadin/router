import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import animate from '../../src/transitions/animate.js';
import '../setup.js';

describe('animate', () => {
  let target: Element;

  function registerElement(element: `${string}-${string}`, template: string) {
    const tpl = document.createElement('template');
    tpl.innerHTML = template;

    const ElementClass = class extends HTMLElement {
      connectedCallback() {
        const root = this.attachShadow({ mode: 'open' });
        root.appendChild(document.importNode(tpl.content, true));
      }
    };

    customElements.define(element, ElementClass);
  }

  function attach(element: string) {
    target = document.createElement(element);
    document.body.appendChild(target);
  }

  afterEach(() => {
    document.body.removeChild(target);
  });

  it('should wait for animation if CSS is applied to `animating` attribute', async () => {
    const element = 'x-fade-out';
    const className = 'animating';

    registerElement(
      element,
      `
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
        `,
    );

    attach(element);
    const spy = sinon.spy();
    target.addEventListener('animationend', spy);

    await animate(target, className);
    expect(spy).to.be.calledOnce;
  });
});

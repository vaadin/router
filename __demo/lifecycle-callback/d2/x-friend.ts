import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterLocation, WebComponentInterface } from '../../../src/types.t.js';

@customElement('x-friend')
export default class Friend extends LitElement implements WebComponentInterface {
  override render(): TemplateResult {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }

  onAfterEnter(_: RouterLocation): void {
    for (const h2 of this.querySelectorAll('h2')) {
      h2.setAttribute('style', 'color: red');
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const h2 = document.createElement('h2');
    h2.textContent = 'I am here!';
    this.appendChild(h2);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-friend': Friend;
  }
}

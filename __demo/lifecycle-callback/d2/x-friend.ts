import { css, html, LitElement, render, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterLocation, WebComponentInterface } from '../../../src/types.t.js';

@customElement('x-friend')
export default class Friend extends LitElement implements WebComponentInterface {
  static override styles = css`
    ::slotted(h2) {
      color: red !important;
    }
  `;

  override render(): TemplateResult {
    return html`<div><slot></slot></div>`;
  }

  onAfterEnter(_: RouterLocation): void {
    render(html`<h2>I am here!</h2>`, this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-friend': Friend;
  }
}

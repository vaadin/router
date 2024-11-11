import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation } from '@vaadin/router';

@customElement('x-hash-view')
export class HashView extends LitElement {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html` Current hash: ${this.location?.hash ?? 'unknown'} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-hash-view': HashView;
  }
}
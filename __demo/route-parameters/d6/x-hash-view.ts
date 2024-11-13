import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

// tag::snippet[]
@customElement('x-hash-view')
export class HashView extends LitElement implements WebComponentInterface {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html` Current hash: ${this.location?.hash ?? 'unknown'} `;
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'x-hash-view': HashView;
  }
}

/* eslint-disable @typescript-eslint/class-methods-use-this */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

// tag::snippet[]
@customElement('x-page-number-view')
export default class PageNumberView extends LitElement implements WebComponentInterface {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`Page number: ${this.#getPageNumber()}`;
  }

  #getPageNumber(): string {
    return this.location?.searchParams.get('page') ?? 'none';
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'x-page-number-view': PageNumberView;
  }
}

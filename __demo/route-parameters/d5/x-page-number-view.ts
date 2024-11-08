/* eslint-disable @typescript-eslint/class-methods-use-this */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation } from '@vaadin/router';

@customElement('x-page-number-view')
export default class PageNumberView extends LitElement {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`Page number: ${this.#getPageNumber(this.location)}`;
  }

  #getPageNumber(location?: RouterLocation): string {
    return location?.searchParams.get('page') ?? 'none';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-page-number-view': PageNumberView;
  }
}

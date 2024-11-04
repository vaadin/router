import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('x-main-page')
export class MainPage extends LitElement {
  override render(): TemplateResult {
    return html`<a href="/edit">Edit the text</a>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-main-page': MainPage;
  }
}

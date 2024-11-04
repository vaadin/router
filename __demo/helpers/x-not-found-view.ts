import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import css from './common.css?ctr';

@customElement('x-not-found-view')
export class NotFoundView extends LitElement {
  static override styles = css;

  override render(): TemplateResult {
    return html`
      <h1>404</h1>
      <p>View not found</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-not-found-view': NotFoundView;
  }
}

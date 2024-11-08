import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import css from './common.css?ctr';
import type { RouterLocation } from '@vaadin/router';

declare global {
  interface HTMLElementTagNameMap {
    'x-user-numeric-view': UserNumericView;
  }
}

@customElement('x-user-numeric-view')
export default class UserNumericView extends LitElement {
  static override styles = [css];
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`<h1>User Profile</h1>
      <p>ID: ${this.location?.params[0] ?? 'unknown'}</p>`;
  }
}

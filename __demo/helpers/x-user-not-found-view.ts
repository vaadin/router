import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import css from './common.css?ctr';
import type { RouterLocation } from '@vaadin/router';

@customElement('x-user-not-found-view')
export class UserNotFoundView extends LitElement {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  static override styles = [css];

  override render(): TemplateResult {
    return html`
      <h1>The princess is in another castle</h1>
      <p>You've come to <code>${this.location?.pathname}</code>, but alas, there is nothing there.</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-user-not-found-view': UserNotFoundView;
  }
}

import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import css from './common.css?ctr';
import type { RouterLocation } from '@vaadin/router';

declare global {
  interface HTMLElementTagNameMap {
    'x-profile-view': ProfileView;
  }
}

@customElement('x-profile-view')
export default class ProfileView extends LitElement {
  static override styles = [css];
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`User ID: ${this.location?.params.id ?? 'unknown'}<br />
      <code>/user</code> or <code>/users</code>: ${this.location?.params[0] ?? 'unknown'}`;
  }
}

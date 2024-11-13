import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import css from './common.css?ctr';
import type { RouterLocation } from '@vaadin/router';

declare global {
  interface HTMLElementTagNameMap {
    'x-user-profile': UserProfile;
  }
}

@customElement('x-user-profile')
export default class UserProfile extends LitElement {
  static override styles = css;

  @property({ attribute: false }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`<h1>User Profile</h1>
      <p>Name: ${this.location?.params.user ?? 'unknown'}</p>`;
  }
}

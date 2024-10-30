import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation } from '../../src/index.js';
import css from './common.css?ctr';
import theme from './theme.js';

declare global {
  interface HTMLElementTagNameMap {
    'x-user-profile': UserProfile;
  }
}

@customElement('x-user-profile')
@theme
export default class UserProfile extends LitElement {
  static override styles = css;

  @property({ attribute: false }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`<h1>User Profile</h1>
      <p>Name: ${this.location?.params.user}</p>`;
  }
}

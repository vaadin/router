import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import css from './common.css?ctr';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

@customElement('x-login-view')
export default class LoginView extends LitElement implements WebComponentInterface {
  static override styles = [css];

  location?: RouterLocation;

  override render(): TemplateResult {
    return html`
      <h1>Login Form</h1>
      <button @click="${this.#login}">Login with OAuth</button>
    `;
  }

  #login() {
    window.authorized = true;
    dispatchEvent(
      new CustomEvent('vaadin-router-go', {
        detail: { pathname: this.location?.params.to ?? '/' },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-login-view': LoginView;
  }
}

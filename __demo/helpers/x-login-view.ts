import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import css from './common.css?ctr';

@customElement('x-login-view')
export default class LoginView extends LitElement {
  static override styles = [css];

  override render(): TemplateResult {
    return html`
      <h1>Login Form</h1>
      <button @click="${this.#login}">Login with OAuth</button>
    `;
  }

  #login(): void {
    window.authorized = true;
    dispatchEvent(
      new CustomEvent('vaadin-router-go', {
        detail: { pathname: '/home' },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-login-view': LoginView;
  }
}

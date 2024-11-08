import { html, LitElement, type nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { router } from './script.js';

@customElement('x-main-layout')
export default class MainLayout extends LitElement {
  override render(): TemplateResult | typeof nothing {
    return html`
      <a href="${router.urlForPath('/')}">Home</a>
      <a href="${router.urlForPath('/users')}">Users</a>
      <a href="${router.urlForPath('/users/:user', { user: 'me' })}">My profile</a>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-main-layout': MainLayout;
  }
}

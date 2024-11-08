import { html, LitElement, type nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
// eslint-disable-next-line import/no-cycle
import { router } from './script.js';

@customElement('x-main-layout')
export default class MainLayout extends LitElement {
  override render(): TemplateResult | typeof nothing {
    return html`
      <a href="${router.urlForName('home')}">Home</a>
      <a href="${router.urlForName('x-user-list')}">Users</a>
      <a href="${router.urlForName('x-user-profile', { user: 'me' })}">My profile</a>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-main-layout': MainLayout;
  }
}

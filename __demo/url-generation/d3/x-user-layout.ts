import '@helpers/x-user-profile.js';
import { html, LitElement, type nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { router } from './script.js';
import type { RouterLocation } from '@vaadin/router';

function getUrlForUser(user: string): string {
  return router.urlForPath('/users/:user', { user });
}

@customElement('x-user-layout')
export default class UserLayout extends LitElement {
  @property({ attribute: false }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult | typeof nothing {
    return html`
      <x-user-profile .location=${this.location}></x-user-profile>
      <a href=${getUrlForUser('me')}>My profile</a>
      <a href=${getUrlForUser('admin')}>Admin profile</a>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-user-layout': UserLayout;
  }
}

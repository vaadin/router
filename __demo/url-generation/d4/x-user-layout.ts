import '@helpers/x-user-profile.js';
import { html, LitElement, type nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { router } from './script.js';
import type { RouterLocation } from '@vaadin/router';

@customElement('x-user-layout')
export default class UserLayout extends LitElement {
  @property({ attribute: false }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult | typeof nothing {
    return html`
      <x-user-profile .location=${this.location}></x-user-profile>
      <a href=${router.urlForName('users', { user: 'me' })}>My profile</a>
      <a href=${router.urlForPath('users/:user', { user: 'manager' })}>Manager profile</a>
      <a href=${ifDefined(this.location?.getUrl({ user: 'admin' }))}>Admin profile</a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-user-layout': UserLayout;
  }
}

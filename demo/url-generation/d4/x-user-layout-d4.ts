import '@helpers/x-user-profile.js';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouteExtension } from './script.js';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

// tag::snippet[]
@customElement('x-user-layout-d4')
export default class UserLayoutD4 extends LitElement implements WebComponentInterface<RouteExtension> {
  @property({ attribute: false }) accessor location: RouterLocation<RouteExtension> | undefined;

  override render(): TemplateResult | typeof nothing {
    return this.location?.route
      ? html`
          <x-user-profile .location=${this.location}></x-user-profile>
          <a href=${this.location.route.router.urlForName('users', { user: 'me' })}>My profile</a>
          <a href=${this.location.route.router.urlForPath('users/:user', { user: 'manager' })}>Manager profile</a>
          <a href=${this.location.getUrl({ user: 'admin' })}>Admin profile</a>
        `
      : nothing;
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'x-user-layout-d4': UserLayoutD4;
  }
}

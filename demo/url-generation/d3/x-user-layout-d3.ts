import '@helpers/x-user-profile.js';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { RouteExtension } from './script.js';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

// tag::snippet[]
@customElement('x-user-layout-d3')
export default class UserLayoutD3 extends LitElement implements WebComponentInterface<RouteExtension> {
  @property({ attribute: false }) accessor location: RouterLocation<RouteExtension> | undefined;

  override render(): TemplateResult | typeof nothing {
    return this.location?.route
      ? html`
          <x-user-profile .location=${this.location}></x-user-profile>
          <a href=${ifDefined(this.#getUrlForUser('me'))}>My profile</a>
          <a href=${ifDefined(this.#getUrlForUser('admin'))}>Admin profile</a>
          <slot></slot>
        `
      : nothing;
  }

  #getUrlForUser(user: string): string | undefined {
    return this.location?.route?.router.urlForPath('/users/:user', { user });
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'x-user-layout-d3': UserLayoutD3;
  }
}

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouteExtension } from './script.js';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

// tag::snippet[]
@customElement('x-main-layout')
export default class MainLayout extends LitElement implements WebComponentInterface<RouteExtension> {
  @property({ attribute: false }) accessor location: RouterLocation<RouteExtension> | undefined;

  override render(): TemplateResult | typeof nothing {
    return this.location?.route
      ? html`
          <a href="${this.location.route.router.urlForPath('/')}">Home</a>
          <a href="${this.location.route.router.urlForPath('/users')}">Users</a>
          <a href="${this.location.route.router.urlForPath('/users/:user', { user: 'me' })}">My profile</a>
          <slot></slot>
        `
      : nothing;
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'x-main-layout': MainLayout;
  }
}

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouteExtension } from './script.js';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

@customElement('x-main-layout')
export default class MainLayout extends LitElement implements WebComponentInterface<RouteExtension> {
  location?: RouterLocation<RouteExtension>;

  override render(): TemplateResult | typeof nothing {
    return this.location?.route
      ? html`
          <a href="${this.location.route.router.urlForName('home')}">Home</a>
          <a href="${this.location.route.router.urlForName('x-user-list')}">Users</a>
          <a href="${this.location.route.router.urlForName('x-user-profile', { user: 'me' })}">My profile</a>
          <slot></slot>
        `
      : nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-main-layout': MainLayout;
  }
}

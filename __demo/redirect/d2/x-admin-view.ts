import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { Commands, RedirectResult, RouterLocation, WebComponentInterface } from '@vaadin/router';

declare global {
  interface HTMLElementTagNameMap {
    'x-admin-view': AdminView;
  }

  interface Window {
    authorized: boolean;
  }
}

@customElement('x-admin-view')
export default class AdminView extends LitElement implements WebComponentInterface {
  onBeforeEnter(location: RouterLocation, commands: Commands): RedirectResult | undefined {
    if (!window.authorized) {
      return commands.redirect(`/login/${encodeURIComponent(location.pathname)}`);
    }

    return undefined;
  }

  override render(): TemplateResult {
    return html`Secret admin stuff`;
  }
}

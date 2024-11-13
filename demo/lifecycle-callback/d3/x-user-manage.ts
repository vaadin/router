import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation, PreventAndRedirectCommands, WebComponentInterface, PreventResult } from '@vaadin/router';

// tag::snippet[]
@customElement('x-user-manage')
export default class UserManage extends LitElement implements WebComponentInterface {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`
      <div>
        <h1>Manage user</h1>
        <p>User name: ${this.location?.params.user}</p>
        <a href="/user/delete">Delete user</a>
      </div>
    `;
  }

  onBeforeLeave(location: RouterLocation, commands: PreventAndRedirectCommands): PreventResult | undefined {
    if (location.pathname.indexOf('user/delete') > 0) {
      // eslint-disable-next-line no-alert
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return commands.prevent();
      }
    }

    return undefined;
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'x-user-manage': UserManage;
  }
}

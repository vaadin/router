import { LitElement, html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import css from './common.css?ctr';
import theme from './theme.js';

declare global {
  interface HTMLElementTagNameMap {
    'x-user-list': UserList;
  }
}

@customElement('x-user-list')
@theme
export default class UserList extends LitElement {
  static override styles = css;
  override render(): TemplateResult {
    return html`<h1>Users</h1>
      <ul>
        <li><a href="/users/kim">Kim</a></li>
        <li><a href="/users/jane">Jane</a></li>
        <li><a href="/users/sam">Sam</a></li>
      </ul>`;
  }
}

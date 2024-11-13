import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { WebComponentInterface } from '../../../src/types.t.js';

// tag::snippet[]
@customElement('x-user-deleted')
export default class UserDeleted extends LitElement implements WebComponentInterface {
  override render(): TemplateResult {
    return html` <div>User has been deleted.</div> `;
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'x-user-deleted': UserDeleted;
  }
}

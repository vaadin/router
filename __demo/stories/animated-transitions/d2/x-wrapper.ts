import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import css from './x-wrapper.css?ctr';

declare global {
  interface HTMLElementTagNameMap {
    'x-wrapper': Wrapper;
  }
}

@customElement('x-wrapper')
export default class Wrapper extends LitElement {
  static override styles = css;

  override render(): TemplateResult {
    return html`<nav>
        <a href="/users">Users</a>
        <a href="/users/kim">Kim</a>
        <a href="/users/jane">Jane</a>
      </nav>
      <main>
        <slot></slot>
      </main>`;
  }
}

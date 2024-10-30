import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedCss from '@helpers/shared-styles.css?ctr';
import theme from '@helpers/theme.js';

declare global {
  interface HTMLElementTagNameMap {
    'x-wrapper': Wrapper;
  }
}

@customElement('x-wrapper')
@theme
export default class Wrapper extends LitElement {
  static override styles = sharedCss;

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

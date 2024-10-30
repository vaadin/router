import { LitElement, html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import css from './common.css?ctr';
import theme from './theme.js';

declare global {
  interface HTMLElementTagNameMap {
    'x-home-view': HomeView;
  }
}

@customElement('x-home-view')
@theme
export default class HomeView extends LitElement {
  static override styles = css;

  override render(): TemplateResult {
    return html`<h1>Home</h1>`;
  }
}

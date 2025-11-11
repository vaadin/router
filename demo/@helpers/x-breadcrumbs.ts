import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import css from './common.css?ctr';

export type Breadcrumb = Readonly<{
  title: string;
  href: string;
}>;

@customElement('x-breadcrumbs')
export class Breadcrumbs extends LitElement {
  static override styles = css;

  @property({ type: Array }) accessor items: readonly Breadcrumb[] = [];

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  #isNotLastIndexOf(items: readonly Breadcrumb[], i: number): boolean {
    return i < items.length - 1;
  }

  override render(): TemplateResult {
    return html`
      <nav>
        ${map(
          this.items,
          (item, index) => html`
            <a href=${item.href}>${item.title}</a>
            ${this.#isNotLastIndexOf(this.items, index) ? html`<span class="delimiter"> > </span>` : nothing}
          `,
        )}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-breadcrumbs': Breadcrumbs;
  }
}

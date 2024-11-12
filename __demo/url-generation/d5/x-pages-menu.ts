import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { RouterLocation } from '@vaadin/router';

const pages = [1, 2, 3, 4, 5];

function urlForPageNumber(location: RouterLocation, pageNumber: number) {
  const query = new URLSearchParams({ page: String(pageNumber) }).toString();
  return `${location.getUrl()}?${query}`;
}

function urlForSection(location: RouterLocation, section: string) {
  return `${location.getUrl()}#${section}`;
}

@customElement('x-pages-menu')
export class PagesMenu extends LitElement {
  static override styles = css`
    nav {
      display: flex;
      gap: 0.5rem;
    }
  `;

  @property({ attribute: false }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult | typeof nothing {
    return this.location
      ? html`<nav>
            Pages:
            ${map(
              pages,
              (pageNumber) => html`<a href=${urlForPageNumber(this.location!, pageNumber)}>${pageNumber}</a>`,
            )}
          </nav>
          <nav>
            Sections:
            <a href=${urlForSection(this.location, 'summary')}>Summary</a>
            <a href=${urlForSection(this.location, 'footnotes')}>Footnotes</a>
          </nav>`
      : nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-pages-menu': PagesMenu;
  }
}

import '@vaadin/tabs';
import '@vaadin/tabsheet';
import '@vaadin/tabs/src/vaadin-tab';
import css from 'highlight.js/styles/kimbie-light.css?ctr';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import theme from './theme.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-code-snippet': DemoCodeSnippet;
  }
}

export type CodeSnippet = Readonly<{
  id?: string;
  code: TemplateResult;
  title?: string;
}>;

@customElement('vaadin-demo-code-snippet')
@theme
export default class DemoCodeSnippet extends LitElement {
  static override styles = css;

  @property({ attribute: false }) accessor files: readonly CodeSnippet[] = [];

  override render(): TemplateResult {
    switch (this.files.length) {
      case 0:
        return html``;
      case 1:
        return html`<pre><code>${this.files[0].code}</code></pre>`;
      default:
        return html`<vaadin-tabsheet>
          <vaadin-tabs slot="tabs">
            ${repeat(
              this.files,
              ({ id }) => id,
              ({ id, title }) => (id ? html`<vaadin-tab id=${id}>${title}</vaadin-tab>` : nothing),
            )}
          </vaadin-tabs>

          ${repeat(
            this.files,
            ({ id }) => id,
            ({ id, code }) =>
              id
                ? html`<div tab=${id}>
                    <pre><code>${code}</code></pre>
                  </div>`
                : nothing,
          )}
        </vaadin-tabsheet>`;
    }
  }
}

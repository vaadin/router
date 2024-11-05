import '@vaadin/accordion';
import highlightCss from 'highlight.js/styles/kimbie-light.css?ctr';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import '@vaadin/accordion/src/vaadin-accordion-panel';
import css from './vaadin-demo-code-snippet.css?ctr';

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
export default class DemoCodeSnippet extends LitElement {
  static override styles = [highlightCss, css];

  @property({ attribute: false }) accessor files: readonly CodeSnippet[] = [];

  override render(): TemplateResult {
    switch (this.files.length) {
      case 0:
        return html``;
      case 1:
        return html`<pre><code>${this.files[0].code}</code></pre>`;
      default:
        return html`
          ${repeat(
            this.files,
            ({ id }) => id,
            ({ id, code, title }) =>
              id
                ? html`<vaadin-accordion>
                    <vaadin-accordion-panel summary=${ifDefined(title)}>
                      <pre><code>${code}</code></pre>
                    </vaadin-accordion-panel>
                  </vaadin-accordion>`
                : nothing,
          )}
        `;
    }
  }
}

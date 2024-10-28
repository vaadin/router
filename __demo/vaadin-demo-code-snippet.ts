import '@vaadin/tabs';
import '@vaadin/tabsheet';
import css from 'highlight.js/styles/atom-one-dark.css?ctr';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import '@vaadin/tabs/src/vaadin-tab';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-code-snippet': DemoCodeSnippet;
  }
}

export type CodeSnippet = Readonly<{
  id: string;
  code: TemplateResult;
  title: string;
}>;

@customElement('vaadin-demo-code-snippet')
export default class DemoCodeSnippet extends LitElement {
  static override styles = css;

  @property({ attribute: false }) accessor files: readonly CodeSnippet[] = [];

  override render(): TemplateResult {
    return html`<vaadin-tabsheet>
      <vaadin-tabs slot="tabs">
        ${repeat(
          this.files,
          ({ id }) => id,
          ({ id, title }) => html`<vaadin-tab id=${id}>${title}</vaadin-tab>`,
        )}
      </vaadin-tabs>

      ${repeat(
        this.files,
        ({ id }) => id,
        ({ id, code }) =>
          html`<div tab=${id}>
            <pre><code>${code}</code></pre>
          </div>`,
      )}
    </vaadin-tabsheet>`;
  }
}

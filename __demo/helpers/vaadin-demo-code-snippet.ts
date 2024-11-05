import '@vaadin/accordion';
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

  interface WindowEventMap {
    'theme-changed': CustomEvent<string>;
  }
}

export type CodeSnippet = Readonly<{
  id?: string;
  code: TemplateResult;
  title?: string;
}>;

@customElement('vaadin-demo-code-snippet')
export default class DemoCodeSnippet extends LitElement {
  static override styles = [css];

  @property({ attribute: false }) accessor files: readonly CodeSnippet[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('theme', document.documentElement.getAttribute('theme') ?? 'light');
    addEventListener('theme-changed', ({ detail: theme }: CustomEvent<string>) => {
      this.setAttribute('theme', theme);
    });
  }

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

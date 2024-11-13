/* eslint-disable @typescript-eslint/unbound-method */
import '@vaadin/button/src/vaadin-button';
import '@vaadin/icon/src/vaadin-icon';
import { type TemplateResult, LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import ThemeController from './theme-controller.js';
import css from './vaadin-demo-code-snippet-file.css?ctr';

export type CodeSnippet = Readonly<{
  id?: string;
  code: [original: string, full: TemplateResult, ...rest: TemplateResult[]];
  title?: string;
}>;

@customElement('vaadin-demo-code-snippet-file')
export default class DemoCodeSnippetFile extends LitElement {
  static override styles = [css];

  @property({ attribute: false }) accessor file: CodeSnippet | undefined;

  @state() accessor #expanded = false;

  readonly #theme = new ThemeController(this);

  override updated(): void {
    this.setAttribute('theme', this.#theme.value);
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.file) {
      return nothing;
    }

    const [_, full, ...snippets] = this.file.code;

    return html`
      <header>
        <div class="title">${this.file.title}</div>
        <div class="buttons">
          <vaadin-icon icon="vaadin:expand" @click=${this.#toggleExpanded}></vaadin-icon>
          <vaadin-icon icon="vaadin:copy" @click=${this.#copyToClipboard}></vaadin-icon>
        </div>
      </header>
      <section>
        ${this.#expanded
          ? html`<pre><code>${full}</code></pre>`
          : map(snippets, (snippet) => html`<pre><code>${snippet}</code></pre>`)}
      </section>
    `;
  }

  #toggleExpanded(): void {
    this.#expanded = !this.#expanded;
  }

  async #copyToClipboard(): Promise<void> {
    const [original] = this.file?.code ?? [];
    if (original) {
      await navigator.clipboard.writeText(original);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-code-snippet-file': DemoCodeSnippetFile;
  }
}

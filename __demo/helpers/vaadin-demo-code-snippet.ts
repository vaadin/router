import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import css from './vaadin-demo-code-snippet.css?ctr';
import './vaadin-demo-code-snippet-file.js';

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

function renderFile(file: CodeSnippet, theme: string): TemplateResult {
  return html`<vaadin-demo-code-snippet-file theme=${theme} .file=${file}></vaadin-demo-code-snippet-file>`;
}

@customElement('vaadin-demo-code-snippet')
export default class DemoCodeSnippet extends LitElement {
  static override styles = [css];

  @property({ attribute: false }) accessor files: readonly CodeSnippet[] = [];

  @state() accessor #theme = document.documentElement.getAttribute('theme') ?? 'light';

  readonly #controller = new AbortController();

  override connectedCallback(): void {
    super.connectedCallback();
    addEventListener(
      'theme-changed',
      ({ detail: theme }: CustomEvent<string>) => {
        this.#theme = theme;
      },
      { signal: this.#controller.signal },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#controller.abort();
  }

  override render(): TemplateResult {
    switch (this.files.length) {
      case 0:
        return html``;
      case 1:
        return renderFile(this.files[0], this.#theme);
      default:
        return html`
          ${repeat(
            this.files,
            ({ id }) => id,
            (file) => renderFile(file, this.#theme),
          )}
        `;
    }
  }
}

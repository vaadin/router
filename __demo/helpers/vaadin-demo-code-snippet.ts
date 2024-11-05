import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import css from './vaadin-demo-code-snippet.css?ctr';
import './vaadin-demo-code-snippet-file.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-code-snippet': DemoCodeSnippet;
  }

  interface WindowEventMap {
    'theme-changed': Event;
  }
}

export type CodeSnippet = Readonly<{
  id?: string;
  code: TemplateResult;
  title?: string;
}>;

function renderFile(file: CodeSnippet): TemplateResult {
  return html`<vaadin-demo-code-snippet-file .file=${file}></vaadin-demo-code-snippet-file>`;
}

@customElement('vaadin-demo-code-snippet')
export default class DemoCodeSnippet extends LitElement {
  static override styles = [css];

  @property({ attribute: false }) accessor files: readonly CodeSnippet[] = [];

  override render(): TemplateResult {
    switch (this.files.length) {
      case 0:
        return html``;
      case 1:
        return renderFile(this.files[0]);
      default:
        return html` ${repeat(this.files, ({ id }) => id, renderFile)} `;
    }
  }
}

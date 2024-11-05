import { type TemplateResult, LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import css from './vaadin-demo-code-snippet-file.css?ctr';

export type CodeSnippet = Readonly<{
  id?: string;
  code: TemplateResult;
  title?: string;
}>;

@customElement('vaadin-demo-code-snippet-file')
export default class DemoCodeSnippetFile extends LitElement {
  static override styles = [css];

  @property({ attribute: false }) accessor file: CodeSnippet | undefined;

  override render(): TemplateResult | typeof nothing {
    return this.file
      ? html`
          <header>${this.file.title}</header>
          <pre><code>${this.file.code}</code></pre>
        `
      : nothing;
  }
}

import '@vaadin/tabs';
import '@vaadin/tabsheet';
import hljs from 'highlight.js/lib/core';
import cssLang from 'highlight.js/lib/languages/css';
import typescriptLang from 'highlight.js/lib/languages/typescript';
import xmlLang from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/styles/atom-one-dark.css?ctr';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';

hljs.registerLanguage('ts', typescriptLang);
hljs.registerLanguage('html', xmlLang);
hljs.registerLanguage('css', cssLang);

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-code-snippet': DemoCodeSnippet;
  }
}

const snippetStart = {
  html: '<!-- tag::snippet[] -->',
  ts: '// tag::snippet[]',
  css: '/* tag::snippet[] */',
} as const;

const snippetEnd = {
  html: '<!-- end::snippet[] -->',
  ts: '// end::snippet[]',
  css: '/* end::snippet[] */',
} as const;

function extractSnippet(code: string, language: keyof typeof snippetStart) {
  let firstIndex = code.indexOf(snippetStart[language]);
  let lastIndex = code.indexOf(snippetEnd[language]);

  firstIndex = firstIndex === -1 ? 0 : firstIndex + snippetStart[language].length;
  lastIndex = lastIndex === -1 ? code.length : lastIndex;

  return code.substring(firstIndex, lastIndex).trim();
}

function transformCode(code: string | undefined, language: keyof typeof snippetStart) {
  return code ? hljs.highlight(extractSnippet(code, language), { language }).value : undefined;
}

@customElement('vaadin-demo-code-snippet')
export default class DemoCodeSnippet extends LitElement {
  static override styles = css;

  @property({ attribute: false, type: String }) accessor html: string | undefined;
  @property({ attribute: false, type: String }) accessor ts: string | undefined;
  @property({ attribute: false, type: String }) accessor css: string | undefined;

  override render(): TemplateResult {
    const htmlCode = transformCode(this.html, 'html');
    const tsCode = transformCode(this.ts, 'ts');
    const cssCode = transformCode(this.css, 'css');

    return html`<vaadin-tabsheet>
      <vaadin-tabs slot="tabs">
        ${when(htmlCode, () => html`<vaadin-tab id="html">HTML</vaadin-tab>`)}
        ${when(tsCode, () => html`<vaadin-tab id="ts">TS</vaadin-tab>`)}
        ${when(cssCode, () => html`<vaadin-tab id="css">CSS</vaadin-tab>`)}
      </vaadin-tabs>

      ${when(
        htmlCode,
        () =>
          html`<div tab="html">
            <pre><code>${unsafeHTML(htmlCode)}</code></pre>
          </div>`,
      )}
      ${when(
        tsCode,
        () =>
          html`<div tab="ts">
            <pre><code>${unsafeHTML(tsCode)}</code></pre>
          </div>`,
      )}
      ${when(
        cssCode,
        () =>
          html`<div tab="css">
            <pre><code>${unsafeHTML(cssCode)}</code></pre>
          </div>`,
      )}
    </vaadin-tabsheet>`;
  }
}

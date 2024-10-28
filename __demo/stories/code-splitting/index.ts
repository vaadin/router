import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../../vaadin-presentation.js';
import '../../vaadin-demo-code-snippet.js';
import url1 from './d1/iframe.html?url';
// eslint-disable-next-line import/default
import code1 from './d1/script.js?raw';
import url2 from './d2/iframe.html?url';
// eslint-disable-next-line import/default
import code2 from './d2/script.js?raw';
import url3 from './d3/iframe.html?url';
// eslint-disable-next-line import/default
import code3 from './d3/script.js?raw';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-code-splitting': CodeSplitting;
  }
}

@customElement('vaadin-code-splitting')
export default class CodeSplitting extends LitElement {
  override render(): TemplateResult {
    return html`<h3>Using Dynamic Imports</h3>
      <p>
        Vaadin Router allows you to implement your own loading mechanism for bundles using custom
        <a href="#vaadin-router-route-actions-demos">Route Actions</a>. In that case, you can use
        <a href="https://github.com/tc39/proposal-dynamic-import" target="_blank" rel="noopener">dynamic imports</a> and
        a module bundler to make the code work in browsers not supporting them natively. Both Webpack and Polymer CLI
        support dynamic imports for lazy loading ES modules, and transform them for the older browsers.
      </p>
      <p>
        Note: If the dynamically loaded route has lifecycle callbacks, the action should return a promise that resolves
        only when the route component is loaded (like in the example below). Otherwise the lifecycle callbacks on the
        dynamically loaded route's web component are not called.
      </p>
      <vaadin-presentation src=${url1} .code=${code1}></vaadin-presentation>
      <vaadin-presentation src=${url2} .code=${code2}></vaadin-presentation>
      <vaadin-presentation src=${url3} .code=${code3}></vaadin-presentation>`;
  }
}

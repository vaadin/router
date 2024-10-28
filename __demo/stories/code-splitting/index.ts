/* eslint-disable import/no-duplicates */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../../vaadin-presentation.js';
import '../../vaadin-demo-code-snippet.js';
import type { CodeSnippet } from '../../vaadin-demo-code-snippet.js';
import htmlCode1 from './d1/iframe.html?snippet';
import url1 from './d1/iframe.html?url';
import tsCode1 from './d1/script.js?snippet';
import cssCode1 from './d1/styles.css?snippet';
import htmlCode2 from './d2/iframe.html?snippet';
import url2 from './d2/iframe.html?url';
import tsCode2 from './d2/script.js?snippet';
import cssCode2 from './d2/styles.css?snippet';
import htmlCode1 from './d3/iframe.html?snippet';
import url3 from './d3/iframe.html?url';
import tsCode1 from './d3/script.js?snippet';
import cssCode1 from './d3/styles.css?snippet';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-code-splitting': CodeSplitting;
  }
}

const files1: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode1,
    title: 'HTML',
  },
  {
    id: 'ts',
    code: tsCode1,
    title: 'TS',
  },
  {
    id: 'css',
    code: cssCode1,
    title: 'CSS',
  },
];

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
      <vaadin-presentation src=${url1}>
        <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
      </vaadin-presentation>
      <p>
        If dynamic imports are used both for parent and child routes, then the example above may possibly slow down
        rendering because router would not start importing a child component until its parent is imported.
      </p>

      <h3>Splitting and Lazy-Loading the Routes Configuration</h3>
      <p>
        Vaadin Router supports splitting the routes configuration object into parts and lazily loading them on-demand,
        enabling developers to create non-monolithic app structures. This might be useful for implementing a distributed
        sub routes configuration within a big project, so that multiple teams working on different parts of the app no
        longer have to merge their changes into the same file.
      </p>
      <p>
        The <code>children</code> property on the route config object can be set to a function, which returns an array
        of the route objects. It may return a <code><b>Promise</b></code
        >, which allows to dynamically import the configuration file, and return the children array exported from it.
      </p>
      <p>
        See the <a href="../#/classes/Router#method-setRoutes" target="_parent">API documentation</a> for detailed
        description of the <code>children</code> callback function.
      </p>
      <vaadin-presentation src=${url2} .code=${code2}></vaadin-presentation>
      <h3>Lazy Loading non-JS Bundles, e.g. HTML Imports</h3>
      <p>
        In cases when loading <code>.js</code> and <code>.mjs</code> is not enough&mdash;most notably, when using HTML
        imports in Polymer-based apps&mdash;the lazy loading feature can be implemented with a custom route action (for
        more details see <a href="#vaadin-router-route-actions-demos"> Route Actions</a>).
      </p>
      <p>
        This demo shows a way to lazily add an HTML import. The <code>user.bundle.html</code>
        file contains entire Polymer 2 component definition including a template, a class, and a script that defines a
        custom element.
      </p>
      <vaadin-presentation src=${url3} .code=${code3}></vaadin-presentation>`;
  }
}

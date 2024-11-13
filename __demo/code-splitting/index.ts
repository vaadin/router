/* eslint-disable import/no-duplicates, import/default */
import '@helpers/common.js';
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import htmlCode1 from './d1/iframe.html?snippet';
import tsCode1 from './d1/script.js?snippet';
import bundleCode from './d1/user.bundle.js?snippet';

import htmlCode2 from './d2/iframe.html?snippet';
import tsCode2 from './d2/script.js?snippet';
import userRoutesCode from './d2/user-routes.js?snippet';

import css from '@helpers/page.css?ctr';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-code-splitting': DemoCodeSplitting;
  }
}

const files1: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode1,
    title: 'iframe1.html',
  },
  {
    id: 'ts',
    code: tsCode1,
    title: 'script1.ts',
  },
  {
    id: 'bundle',
    code: bundleCode,
    title: 'user-bundle.ts',
  },
];

const files2: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode2,
    title: 'iframe2.html',
  },
  {
    id: 'ts',
    code: tsCode2,
    title: 'script2.ts',
  },
  {
    id: 'routes',
    code: userRoutesCode,
    title: 'user-routes.ts',
  },
];

@customElement('vaadin-demo-code-splitting')
export default class DemoCodeSplitting extends LitElement {
  static override styles = [css];

  override render(): TemplateResult {
    return html`<h3>Using Dynamic Imports</h3>
      <p>
        Vaadin Router allows you to implement your own loading mechanism for bundles using custom
        <a href="#vaadin-router-route-actions-demos">Route Actions</a>. In that case, you can use
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import"
          target="_blank"
          rel="noopener"
          >dynamic imports</a
        >.
      </p>
      <p>
        Note: If the dynamically loaded route has lifecycle callbacks, the action should return a promise that resolves
        only when the route component is loaded (like in the example below). Otherwise the lifecycle callbacks on the
        dynamically loaded route's web component are not called.
      </p>
      <vaadin-presentation src="./d1/iframe.html">
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
      <vaadin-presentation src="./d2/iframe.html">
        <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
      </vaadin-presentation>`;
  }
}

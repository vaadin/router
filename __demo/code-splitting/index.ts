/* eslint-disable import/no-duplicates, import/default */
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import htmlCode1 from './d1/iframe.html?snippet';
import url1 from './d1/iframe.html?url';
import tsCode1 from './d1/script.js?snippet';
import htmlCode2 from './d2/iframe.html?snippet';
import url2 from './d2/iframe.html?url';
import tsCode2 from './d2/script.js?snippet';
import theme from '@helpers/theme.js';
import userRoutesCode from '@helpers/user-routes.js?snippet';
import bundleCode from '@helpers/user.bundle.js?snippet';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-code-splitting': DemoCodeSplitting;
  }
}

const files1: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode1[0],
    title: 'HTML',
  },
  {
    id: 'ts',
    code: tsCode1[0],
    title: 'TS',
  },
  {
    id: 'bundle',
    code: bundleCode[0],
    title: 'User Bundle',
  },
];

const files2: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode2[0],
    title: 'HTML',
  },
  {
    id: 'ts',
    code: tsCode2[0],
    title: 'TS',
  },
  {
    id: 'routes',
    code: userRoutesCode[0],
    title: 'User Routes',
  },
];

@customElement('vaadin-demo-code-splitting')
@theme
export default class DemoCodeSplitting extends LitElement {
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
      <vaadin-presentation src=${url2}>
        <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
      </vaadin-presentation>`;
  }
}

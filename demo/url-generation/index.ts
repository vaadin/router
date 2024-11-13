/* eslint-disable import/no-duplicates, import/default */
import '@helpers/common.js';
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import htmlCode1 from './d1/iframe.html?snippet';
import tsCode1 from './d1/script.js?snippet';
import mainLayoutCode1 from './d1/x-main-layout.ts?snippet';

import htmlCode2 from './d2/iframe.html?snippet';
import tsCode2 from './d2/script.js?snippet';
import mainLayoutCode2 from './d2/x-main-layout.ts?snippet';

import htmlCode3 from './d3/iframe.html?snippet';
import tsCode3 from './d3/script.js?snippet';
import userLayoutD3Code from './d3/x-user-layout-d3.ts?snippet';

import htmlCode4 from './d4/iframe.html?snippet';
import tsCode4 from './d4/script.js?snippet';
import userLayoutD4Code from './d4/x-user-layout-d4.ts?snippet';

import htmlCode5 from './d5/iframe.html?snippet';
import tsCode5 from './d5/script.js?snippet';
import pagesMenuCode from './d5/x-pages-menu.ts?snippet';

import css from '@helpers/page.css?ctr';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-url-generation': DemoUrlGeneration;
  }
}

const files1: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode1,
    title: 'iframe.html',
  },
  {
    id: 'ts',
    code: tsCode1,
    title: 'script.ts',
  },
  {
    id: 'main-layout',
    code: mainLayoutCode1,
    title: 'x-main-layout.ts',
  },
];

const files2: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode2,
    title: 'iframe.html',
  },
  {
    id: 'ts',
    code: tsCode2,
    title: 'script.ts',
  },
  {
    id: 'main-layout',
    code: mainLayoutCode2,
    title: 'x-main-layout.ts',
  },
];

const files3: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode3,
    title: 'iframe.html',
  },
  {
    id: 'ts',
    code: tsCode3,
    title: 'script.ts',
  },
  {
    id: 'user-layout',
    code: userLayoutD3Code,
    title: 'x-user-layout.ts',
  },
];

const files4: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode4,
    title: 'iframe.html',
  },
  {
    id: 'ts',
    code: tsCode4,
    title: 'script.ts',
  },
  {
    id: 'user-layout',
    code: userLayoutD4Code,
    title: 'x-user-layout.ts',
  },
];

const files5: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode5,
    title: 'iframe.html',
  },
  {
    id: 'ts',
    code: tsCode5,
    title: 'script.ts',
  },
  {
    id: 'pages-menu',
    code: pagesMenuCode,
    title: 'x-pages-menu.ts',
  },
];

@customElement('vaadin-demo-url-generation')
export default class DemoUrlGeneration extends LitElement {
  static override styles = [css];

  override render(): TemplateResult {
    return html`<h3>Named routes and the <code>router.urlForName</code> method</h3>
      <p>
        Vaadin Router supports referring to routes using string names. You can assign a name to a route using the
        <code>name</code> property of a route object, then generate URLs for that route using the
        <b
          ><code>
            <a target="_parent" href="..#/classes/Router#method-urlForName">router.urlForName(name, parameters)</a>
          </code></b
        >
        helper instance method.
      </p>
      <p>Arguments:</p>
      <ul>
        <li><code>name</code> — the route name</li>
        <li><code>parameters</code> — optional object with parameters for substitution in the route path</li>
      </ul>
      <p>
        If the <code>component</code> property is specified on the route object, the <code>name</code> property could be
        omitted. In that case, the component name could be used in the <code>router.urlForName()</code>.
      </p>
      <vaadin-presentation src="./d1/iframe.html">
        <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>The <code>router.urlForPath</code> method</h3>
      <p>
        <b
          ><code>
            <a target="_parent" href="..#/classes/Router#method-urlForPath"> router.urlForPath(path, parameters)</a>
          </code></b
        >
        is a helper method that generates a URL for the given route path, optionally performing substitution of
        parameters.
      </p>
      <p>Arguments:</p>
      <ul>
        <li><code>path</code> — a string route path defined in express.js syntax</li>
        <li><code>parameters</code> — optional object with parameters for path substitution</li>
      </ul>
      <vaadin-presentation src="./d2/iframe.html">
        <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>The <code>location.getUrl</code> method</h3>
      <p>
        <b
          ><code>
            <a target="_parent" href="..#/classes/Router.Location#method-getUrl"> location.getUrl(params)</a>
          </code></b
        >
        is a method that returns a URL corresponding to the location. When given the params argument, it does parameter
        substitution in the location’s chain of routes.
      </p>
      <p>Arguments:</p>
      <ul>
        <li><code>params</code> — optional object with parameters to override the location parameters</li>
      </ul>
      <vaadin-presentation src="./d3/iframe.html">
        <vaadin-demo-code-snippet .files=${files3}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Base URL in URL generation</h3>
      <p>When base URL is set, the URL generation helpers return absolute pathnames, including the base.</p>
      <vaadin-presentation src="./d4/iframe.html">
        <vaadin-demo-code-snippet .files=${files4}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Generating URLs with search query parameters and hash string</h3>
      <p>
        At the moment, Vaadin Router does not provide URL generation APIs for appending search query parameters or hash
        strings to the generated URLs. However, you could append those with string concatenation.
      </p>
      <p>
        For serialising parameters into a query string, use the native
        <code>URLSearchParams</code> API.
      </p>
      <vaadin-presentation src="./d5/iframe.html">
        <vaadin-demo-code-snippet .files=${files5}></vaadin-demo-code-snippet>
      </vaadin-presentation>`;
  }
}

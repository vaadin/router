/* eslint-disable import/no-duplicates, import/default */
import '@helpers/common.js';
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import htmlCode1 from './d1/iframe.html?snippet';
import url1 from './d1/iframe.html?url';
import tsCode1 from './d1/script.js?snippet';
import htmlSnippet1 from './snippets/s1.html?snippet';
import tsSnippet1 from './snippets/s2.ts?snippet';
import htmlSnippet2 from './snippets/s3.html?snippet';
import tsSnippet2 from './snippets/s4.ts?snippet';
import css from '@helpers/page.css?ctr';
import ThemeController from '@helpers/theme-controller.js';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-getting-started': DemoGettingStarted;
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
];

@customElement('vaadin-demo-getting-started')
export default class DemoGettingStarted extends LitElement {
  static override styles = [css];

  readonly #theme = new ThemeController(this);

  override updated(): void {
    this.setAttribute('theme', this.#theme.value);
  }

  override render(): TemplateResult {
    return html`<h3>The <code>Router</code> class</h3>
      <p>
        The <code>Router</code> class is the only thing you need to get started with Vaadin Router. Depending on your
        project setup, there are several ways to access it.
      </p>
      <p>
        <strong>In modern browsers that support ES modules</strong> the <code> Router</code> class can be imported
        directly into a script tag on a page:
      </p>
      <vaadin-demo-code-snippet .files=${[{ code: htmlSnippet1 }]}></vaadin-demo-code-snippet>
      <p>
        <strong>In Vite / Webpack / Rollup CLI projects</strong> the <code>Router</code> class can be imported from the
        <code>@vaadin/router</code> npm package:
      </p>
      <vaadin-demo-code-snippet .files=${[{ code: tsSnippet1 }]}></vaadin-demo-code-snippet>
      <p>
        <strong>In older browsers without the ES modules support</strong> the <code>Router</code> class is exposed as a
        member of the <code>Vaadin</code>
        namespace after the vaadin-router UMD bundle is loaded:
      </p>
      <vaadin-demo-code-snippet .files=${[{ code: htmlSnippet2 }]}></vaadin-demo-code-snippet>

      <h3>Getting Started</h3>
      <p>
        Vaadin Router automatically listens to navigation events and asynchronously renders a matching Web Component
        into the given DOM node (a.k.a. the router <em>outlet</em>). By default, navigation events are triggered by
        <code>popstate</code> events on the <code>window</code>, and by <code>click</code> events on
        <code>&lt;a&gt;</code> elements on the page.
      </p>
      <p>
        The routes config maps URL paths to Web Components. Vaadin Router goes through the routes until it finds the
        first match, creates an instance of the route component, and inserts it into the router outlet (replacing any
        pre-existing outlet content). For details on the route path syntax see the
        <a href="#vaadin-router-route-parameters-demos">Route Parameters </a> demos.
      </p>
      <vaadin-presentation src=${url1}>
        <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
      </vaadin-presentation>
      <p>
        Route components can be any Web Components regardless of how they are built: vanilla JavaScript, Lit, Stencil,
        SkateJS, Angular, Vue, etc.
      </p>
      <p>
        Vaadin Router follows the lifecycle callbacks convention described in
        <a target="_parent" href="..#/classes/WebComponentInterface">WebComponentInterface</a>: if a route component
        defines any of these callback methods, Vaadin Router will call them at the appropriate points in the navigation
        lifecycle. See the <a href="#vaadin-router-lifecycle-callbacks-demos">Lifecycle Callbacks</a> section for more
        details.
      </p>
      <p>
        In addition to that Vaadin Router also sets a
        <a target="_parent" href="..#/classes/Router.Location"><code>location</code> property</a> on every route Web
        Component so that you could access the current location details via an instance property (e.g.
        <code>this.location.pathname</code>).
      </p>

      <h3>Using <code>this.location</code></h3>
      <p>
        For LitElement and TypeScript a declaration in the component is required. Declare the
        <code>location</code> property in the class and initialize it from the <code>router</code> Vaadin Router
        instance:
      </p>
      <vaadin-demo-code-snippet .files=${[{ code: tsSnippet2 }]}></vaadin-demo-code-snippet>
      <p>This property is automatically updated on navigation.</p>

      <h3>Fallback Routes (404)</h3>
      <p>
        If Vaadin Router does not find a matching route, the promise returned from the <code>render()</code> method gets
        rejected, and any content in the router outlet is removed. In order to show a user-friendly 'page not found'
        view, a fallback route with a wildcard <code>'(.*)'</code> path can be added to the <strong>end</strong> of the
        routes list.
      </p>
      <p>
        There can be different fallbacks for different route prefixes, but since the route resolution is based on the
        first match, the fallback route should always be <strong>after</strong> other alternatives.
      </p>
      <p>
        The path that leads to the fallback route is available to the route component via the
        <code>location.pathname</code> property.
      </p>`;
  }
}

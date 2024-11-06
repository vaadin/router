/* eslint-disable import/no-duplicates, import/default */
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import htmlCode1 from './d1/iframe.html?snippet';
import url1 from './d1/iframe.html?url';
import tsCode1 from './d1/script.js?snippet';
import htmlCode2 from './d2/iframe.html?snippet';
import url2 from './d2/iframe.html?url';
import tsCode2 from './d2/script.js?snippet';
import cssCode2 from './d2/styles.css?snippet';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-redirect': DemoRedirect;
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
];

const files2: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode2,
    title: 'html',
  },
  {
    id: 'ts',
    code: tsCode2,
    title: 'TS',
  },
];

@customElement('vaadin-demo-redirect')
export default class DemoRedirect extends LitElement {
  override render(): TemplateResult {
    return html`<h3>Unconditional Redirects</h3>
    <p>
      Vaadin Router supports the <code>redirect</code> property on the route
      objects, allowing to unconditionally redirect users from one path to
      another. The valid values are a path string or a pattern in the same
      format as used for the <code>path</code> property.
    </p>
    <p>
      The original path is not stored as the <code>window.history</code> entry
      and cannot be reached by pressing the "Back" browser button. Unconditional
      redirects work for routes both with and without parameters.
    <p>
      The original path is available to route Web Components as the
      <a target="_parent" href="..#/classes/Router.Location#property-redirectFrom">
      <code>location.redirectFrom</code></a> string property, and to custom
      <a href="#vaadin-router-route-actions-demos">route actions</a> &ndash;
      as <code>context.redirectFrom</code>.
    </p>
    <p>
      Note: If a route has both the <code>redirect</code> and <code>action</code>
      properties, <code>action</code> is executed first and if it does not
      return a result Vaadin Router proceeds to check the <code>redirect</code>
      property. Other route properties (if any) would be ignored. In that case
      Vaadin Router would also log a warning to the browser console.
    </p>
    <vaadin-presentation src=${url1}>
      <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
    </vaadin-presentation>

    <h3>Dynamic Redirects</h3>
    <p>
      Vaadin Router allows redirecting to another path dynamically based on
      a condition evaluated at the run time. In order to do that, <code>
      return commands.redirect('/new/path')</code> from the
      <a href="#vaadin-router-lifecycle-callbacks-demos"><code>onBeforeEnter()
      </code></a> lifecycle callback of the route Web Component.
    </p>
    <p>
      It is also possible to redirect from a custom route action. The demo below
      has an example of that in the <code>/logout</code> route action. See the
      <a href="#vaadin-router-route-actions-demos">Route Actions</a> section for
      more details.
    </p>
    <vaadin-presentation src=${url2}>
      <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
    </vaadin-presentation>

    <h3>Navigation from JavaScript</h3>
    <p>
      If you want to send users to another path in response to a user
      action (outside of a lifecycle callback), you can do that by using the
      static <a target="_parent" href="..#/classes/Router#staticmethod-go"><code>
      Router.go('/to/path')</code></a> method on the Vaadin.Router class.
    </p>
    <p>
      You can optionally pass search query string and hash to the method, either
      as in-app URL string:
    </p>
    <marked-element>
      <script type="text/markdown">
        Router.go('/to/path?paramName=value#sectionName');
      </script>
    </marked-element>
      ... or using an object with named parameters:
    </p>
    <marked-element>
      <script type="text/markdown">
        Router.go({
          pathname: '/to/path',
          // optional
          search: '?paramName=value',
          // optional
          hash: '#sectionName'
        });
      </script>
    </marked-element>
    <vaadin-demo-snippet id="vaadin-router-redirect-demos-3" iframe-src="iframe.html">
      <template preserve-content>
        <button id="trigger">Open <code>/user/you-know-who</code></button>
        <div id="outlet"></div>

        <script>
          // import {Router} from '@vaadin/router'; // for Webpack / Polymer CLI
          // const Router = Vaadin.Router; // for vaadin-router.umd.js

          document.querySelector('#trigger').addEventListener('click', () => {
            Router.go('/user/you-know-who');
          });

          const router = new Router(document.getElementById('outlet'));
          router.setRoutes([
            {path: '/', component: 'x-home-view'},
            {path: '/user/:user', component: 'x-user-profile'},
          ]);
        </script>
      </template>
    </vaadin-demo-snippet>
    <p>
      NOTE: the same effect can be achieved by dispatching a <code>
      vaadin-router-go</code> custom event on the <code>window</code>. The
      target path should be provided as <code>event.detail.pathname</code>,
      the search and hash strings can be optionally provided
      with <code>event.detail.search</code> and <code>event.detail.hash</code>
      properties respectively.
    </p>
    <marked-element>
      <script type="text/markdown">
        window.dispatchEvent(
          new CustomEvent('vaadin-router-go', {detail: {
            pathname: '/to/path',
            // optional search query string
            search: '?paramName=value',
            // optional hash string
            hash: '#sectionName'
          }}));
      </script>
    </marked-element>`;
  }
}

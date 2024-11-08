/* eslint-disable import/no-duplicates, import/default */
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import htmlCode1 from './d1/iframe.html?snippet';
import url1 from './d1/iframe.html?url';
import tsCode1 from './d1/script.js?snippet';
import cssCode1 from './d1/styles.css?snippet';
import htmlCode2 from './d2/iframe.html?snippet';
import url2 from './d2/iframe.html?url';
import tsCode2 from './d2/script.js?snippet';
import cssCode2 from './d2/styles.css?snippet';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-route-parameters': DemoRouteParameters;
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
  {
    id: 'css',
    code: cssCode2,
    title: 'CSS',
  },
];

@customElement('vaadin-demo-route-parameters')
export default class DemoRouteParameters extends LitElement {
  override render(): TemplateResult {
    return html`<h3>Route Parameters</h3>
    <p>Route parameters are useful when the same Web Component should be
      rendered for a number of paths, where a part of the path is static, and
      another part contains a parameter value. E.g. for both <code>/user/1
      </code> and <code>/user/42</code> paths it's the same Web Component that
      renders the content, the <code>/user/</code> part is static, and <code>1
      </code> and <code>42</code> are the parameter values.</p>
    <p>Route parameters are defined using an express.js-like syntax. The
      implementation is based on the <a href="https://github.com/pillarjs/path-to-regexp#parameters"
      target="_blank" rel="noopener">path-to-regexp</a> library that is commonly
      used in modern front-end libraries and frameworks. All features are
      supported:
  </p>
      <ul>
        <li>named parameters: <code>/profile/:user</code></li>
        <li>optional parameters: <code>/:size/:color?</code></li>
        <li>zero-or-more segments: <code>/kb/:path*</code></li>
        <li>one-or-more segments: <code>/kb/:path+</code></li>
        <li>custom parameter patterns: <code>/image-:size(\d+)px</code></li>
        <li>unnamed parameters: <code>/(user[s]?)/:id</code></li>
      </ul>
    </p>
    <vaadin-presentation src=${url1}>
      <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
    </vaadin-presentation>

    <h3>Accessing Route Parameters</h3>
    <p>
      Route parameters are bound to the <code>location.params</code> property of
      the route Web Component
      (<a target="_parent" href="..#/classes/Router.Location"><code>location</code></a>
      is set on the route components by Vaadin Router).
    </p>
    <ul>
      <li>Named parameters are accessible by a string key, e.g.
        <code>location.params.id</code> or <code>location.params['id']</code></li>
      <li>Unnamed parameters are accessible by a numeric index, e.g.
        <code>location.params[0]</code></li>
    </ul>
    <p>The example below shows how to access route parameters in a Polymer 2
      based Web Component:</p>
    <vaadin-demo-snippet id="vaadin-router-route-parameters-demo-2" iframe-src="iframe.html">
      <template preserve-content>
        <dom-module id="x-project-view">
          <template>
            <h1>Project</h1>
            <p>ID: [[location.params.id]]</p>
            <code>/project</code> or <code>/projects</code>: [[location.params.0]]
          </template>
        </dom-module>

        <a href="/">Home</a>
        <a href="/projects/1">Project 1</a>
        <a href="/project/2">Project 2</a>
        <div id="outlet"></div>
        <script>
          Polymer({is: 'x-project-view'});

          // import {Router} from '@vaadin/router'; // for Webpack / Polymer CLI
          // const Router = Vaadin.Router; // for vaadin-router.umd.js

          const router = new Router(document.getElementById('outlet'));
          router.setRoutes([
            {path: '/', component: 'x-home-view'},
            {path: '/(project[s]?)/:id', component: 'x-project-view'},
          ]);
        </script>
      </template>
    </vaadin-demo-snippet>

    <h3>Ambiguous Matches</h3>
    <p>
      Route matching rules can be ambiguous, so that several routes would match
      the same path. In that case, the order in which the routes are defined is
      important. The first route matching the path gets rendered (starting from
      the top of the list / root of the tree).</p>
    <p>
      The default route matching is <strong>exact</strong>, i.e. a
      <code>'/user'</code> route (if it does not have children) matches only the
      <code>'/user'</code> path, but not <code>'/users'</code> nor
      <code>'/user/42'</code>. Trailing slashes are not significant in paths,
      but are significant in routes, i.e. a <code>'/user'</code> route matches
      both <code>'/user'</code> the <code>'/user/'</code>, but a
      <code>'/user/'</code> route matches only the <code>'/user/'</code> path.
    </p>
    <p><strong>Prefix</strong> matching is used for routes with children, or if
      the route explicitly indicates that trailing content is expected (e.g.
      a <code>'/users/(*.)'</code> route matches any path starting with
      <code>'/users/'</code>).
    </p>
    <p>
      Always place more specific routes before less specific:
    </p>
      <ul>
        <li><code>{path: '/user/new', ...}</code> - matches only
          <code>'/user/new'</code></li>
        <li><code>{path: '/user/:user', ...}</code> - matches
          <code>'/user/42'</code>, but not <code>'/user/42/edit'</code></li>
        <li><code>{path: '/user/(.*)', ...}</code> - matches anything starting
          with <code>'/user/'</code></li>
      </ul>
    </p>
    <vaadin-demo-snippet id="vaadin-router-route-parameters-demo-3" iframe-src="iframe.html">
      <template preserve-content>
        <a href="/">Home</a>
        <a href="/users">All Users</a>
        <a href="/kim">Kim</a>
        <div id="outlet"></div>
        <script>
          // import {Router} from '@vaadin/router'; // for Webpack / Polymer CLI
          // const Router = Vaadin.Router; // for vaadin-router.umd.js

          const router = new Router(document.getElementById('outlet'));
          router.setRoutes([
            {path: '/', component: 'x-home-view'},
            {path: '/users', component: 'x-user-list'},
            {path: '/:user', component: 'x-user-profile'},
          ]);
        </script>
      </template>
    </vaadin-demo-snippet>

    <h3>Typed Route Parameters</h3>
    <p>
      The route can be configured so that only specific characters are accepted for a parameter value.
      Other characters would not meet the check and the route resolution would continue to other routes.
      You only can use unnamed parameters in this case, as it can only be achieved using the custom RegExp.
      One possible alternative is to use <a href="#vaadin-router-route-actions-demos">Route Actions</a>
      and check the <code>context.params</code>.</p>
    <vaadin-demo-snippet id="vaadin-router-route-parameters-demo-4" iframe-src="iframe.html">
      <template preserve-content>
        <a href="/">Home</a>
        <a href="/users/list">All Users</a>
        <a href="/users/42">User 42</a>
        <a href="/users/guest">Guest</a>
        <div id="outlet"></div>
        <script>
          // import {Router} from '@vaadin/router'; // for Webpack / Polymer CLI
          // const Router = Vaadin.Router; // for vaadin-router.umd.js

          const router = new Router(document.getElementById('outlet'));
          router.setRoutes([
            {path: '/', component: 'x-home-view'},
            {path: '/users/list', component: 'x-user-list'},
            {path: '/users/([0-9]+)', component: 'x-user-numeric-view'},
            {path: '/users/(.*)', component: 'x-user-not-found-view'},
          ]);
        </script>
      </template>
    </vaadin-demo-snippet>

    <h3>Search Query Parameters</h3>
    <p>
      The search query string (<code>?example</code>) URL part is considered
      separate from the pathname. Hence, it does not participate in matching
      the route <code>path</code>, and <code>location.params</code> does not
      contain search query string parameters.
    </p>
    <p>
      Use <code>location.search</code> to access the raw search query string.
      Use <code>location.searchParams</code> to get the <code>URLSearchParams</code> wrapper of the search query string.
    </p>
    <vaadin-demo-snippet id="vaadin-router-route-parameters-demo-5" iframe-src="iframe.html">
      <template preserve-content>
        <nav>
          <a href="/">Start page</a>
          <a href="/?page=1">Page 1</a>
          <a href="/?page=2">Page 2</a>
        </nav>
        <div id="outlet"></div>

        <dom-module id="page-number-view">
          <template>
            Page number: [[getPageNumber(location)]]
          </template>
        </dom-module>
        <script>
          // import {Router} from '@vaadin/router'; // for Webpack / Polymer CLI
          // const Router = Vaadin.Router; // for vaadin-router.umd.js

          class PageNumberViewElement extends Polymer.Element {
            static get is() {
              return 'page-number-view';
            }

            getPageNumber(location) {
              return location.searchParams.get('page') || 'none';
            }
          }
          customElements.define(PageNumberViewElement.is, PageNumberViewElement);

          const router = new Router(document.getElementById('outlet'));
          router.setRoutes([
            {path: '/', component: 'page-number-view'},
          ]);
        </script>
      </template>
    </vaadin-demo-snippet>

    <h3>Hash String</h3>
    <p>
      Likewise with the search query, the hash string (<code>#example</code>)
      is separate from the pathname as well. Use <code>location.hash</code>
      to access the hash string in the view component.
    </p>
    <vaadin-demo-snippet id="vaadin-router-route-parameters-demo-6" iframe-src="iframe.html">
      <template preserve-content>
        <nav>
          <a href="/#preface">Preface</a>
          <a href="/#chapter_one">Chapter one</a>
          <a href="/#chapter_two">Chapter two</a>
        </nav>
        <div id="outlet"></div>

        <dom-module id="hash-view">
          <template>
            Current hash: [[location.hash]]
          </template>
        </dom-module>
        <script>
          // import {Router} from '@vaadin/router'; // for Webpack / Polymer CLI
          // const Router = Vaadin.Router; // for vaadin-router.umd.js

          class HashViewElement extends Polymer.Element {
            static get is() {
              return 'hash-view';
            }
          }
          customElements.define(HashViewElement.is, HashViewElement);

          const router = new Router(document.getElementById('outlet'));
          router.setRoutes([
            {path: '/', component: 'hash-view'},
          ]);
        </script>
      </template>
    </vaadin-demo-snippet>`;
  }
}

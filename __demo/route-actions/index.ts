/* eslint-disable import/no-duplicates, import/default */
import '@helpers/common.js';
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import htmlCode1 from './d1/iframe.html?snippet';
import tsCode1 from './d1/script.js?snippet';

import htmlCode2 from './d2/iframe.html?snippet';
import tsCode2 from './d2/script.js?snippet';

import htmlCode3 from './d3/iframe.html?snippet';
import tsCode3 from './d3/script.js?snippet';

import htmlCod4 from './d4/iframe.html?snippet';
import tsCode4 from './d4/script.js?snippet';

import htmlCode5 from './d5/iframe.html?snippet';
import tsCode5 from './d5/script.js?snippet';

import css from '@helpers/page.css?ctr';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-route-actions': DemoRouteActions;
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
];

const files4: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCod4,
    title: 'iframe.html',
  },
  {
    id: 'ts',
    code: tsCode4,
    title: 'script.ts',
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
];

@customElement('vaadin-demo-route-actions')
export default class DemoRouteActions extends LitElement {
  static override styles = [css];

  override render(): TemplateResult {
    return html`<h3>Custom Route Actions</h3>
      <p class="note">This feature is for advanced use cases. Please make sure to read the documentation carefully.</p>
      <p>
        Route resolution is an async operation started by a navigation event, or by an explicit
        <code>render()</code> method call. In that process Vaadin Router goes through the routes config and tries to
        <em>resolve</em> each matching route from the root onwards. The default route resolution rule is to create and
        return an instance of the route's <code>component </code> (see the API docs for the
        <code>setRoutes()</code> method for details on other route properties and how they affect the route resolution).
      </p>
      <p>
        Vaadin Router provides a flexible API to customize the default route resolution rule. Each route may have an
        <code>action</code> functional property that defines how exactly that route is resolved. An
        <code>action </code> function can return a result either directly, or within a <code>Promise</code> resolving to
        the result. If the action result is an <code>HTMLElement</code> instance, a
        <code>commands.component(name)</code> result, a <code>commands.redirect(path)</code> result, or a
        <code>context.next()</code> result, the resolution pass, and the returned value is what gets rendered.
        Otherwise, the resolution process continues to check the other properties of the route and apply the default
        resolution rules, and then further to check other matching routes.
      </p>
      <p>
        The <code>action(context, commands)</code> function receives a <code>context</code>
        parameter with the following properties:
      </p>
      <ul>
        <li><code>context.pathname</code> [string] the pathname being resolved</li>
        <li><code>context.search</code> [string] the search query string</li>
        <li><code>context.hash</code> [string] the hash string</li>
        <li><code>context.params</code> [object] the route parameters</li>
        <li><code>context.route</code> [object] the route that is currently being rendered</li>
        <li>
          <code>context.next()</code> [function] function for asynchronously getting the next route contents from the
          resolution chain (if any)
        </li>
      </ul>
      <p>The <code>commands</code> is a helper object with methods to create return values for the action:</p>
      <ul>
        <li>
          <code>return commands.redirect('/new/path')</code> create and return a redirect command for the specified
          path. This command should be returned from the <code>action</code> to perform an actual redirect.
        </li>
        <li>
          <code>return commands.prevent()</code> create and return a prevent command. This command should be returned
          from the <code>action</code>
          to instruct router to stop the current navigation and remain at the previous location.
        </li>
        <li>
          <code>return commands.component('tag-name')</code> create and return a new <code>HTMLElement</code> that will
          be rendered into the router outlet. Using the <code>component</code> command ensures that the created
          component is initialized as a Vaadin Router view (i.e. the <code>location</code> property is set according to
          the current router context.
          <br />
          If an action returns this element, the behavior is the same as for
          <code>component</code> route property: the action result will be rendered, if the action is in a child route,
          the result will be rendered as light dom child of the component from a parent route.
        </li>
      </ul>
      <p>
        This demo shows how to use the custom <code>action</code> property to collect visit statistics for each route.
      </p>
      <vaadin-presentation src="./d1/iframe.html">
        <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Async Route Resolution</h3>
      <p>
        Since route resolution is async, the <code>action()</code> callback may be async as well and return a promise.
        One use case for that is to create a custom route action that makes a remote API call to fetch the data
        necessary to render the route component, before navigating to a route.
      </p>
      <p>
        Note: If a route has both the <code>component</code> and <code>action </code> properties, <code>action</code> is
        executed first and if it does not return a result Vaadin.Router proceeds to check the
        <code>component </code> property.
      </p>
      <p>This demo shows a way to perform async tasks before navigating to any route under <code>/users</code>.</p>
      <vaadin-presentation src="./d2/iframe.html">
        <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Redirecting from an Action</h3>
      <p>
        <code>action()</code> can return a command created using the <code>commands</code> parameter methods to affect
        the route resolution result. The first demo had demonstrated the <code>context.next()</code> usage, this demo
        demonstrates using <code>commands.redirect(path)</code> to redirect to any other defined route by using its
        path. All the parameters in current context will be passed to the redirect target.
      </p>
      <p>
        Note: If you need only to redirect to another route, defining an action might be an overkill. More convenient
        way is described in <a href="#vaadin-router-redirect-demos">Redirects</a> section.
      </p>
      <vaadin-presentation src="./d3/iframe.html">
        <vaadin-demo-code-snippet .files=${files3}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Returning Custom Element as an Action Result</h3>
      <p>
        Another command available to a custom <code>action()</code> is <code>commands.component('tag-name')</code>. It
        is useful to create a custom element with current context. All the parameters in current context will be passed
        to the rendered element.
      </p>
      <p>
        Note: If the only thing your action does is custom element creation, it can be replaced with
        <code>component</code> property of the route. See
        <a href="#vaadin-router-getting-started-demos">Getting Started</a>
        section for examples.
      </p>
      <vaadin-presentation src="./d4/iframe.html">
        <vaadin-demo-code-snippet .files=${files4}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Routing With Search Query and Hash</h3>
      <p>
        Route action function can access <code>context.search</code> and <code>context.hash</code> URL parts, even
        though they are not involved in matching route paths.
      </p>
      <p>
        For example, an action can change the route behavior depending on a search parameter, and optionally render,
        skip to next route or redirect.
      </p>
      <vaadin-presentation src="./d5/iframe.html">
        <vaadin-demo-code-snippet .files=${files5}></vaadin-demo-code-snippet>
      </vaadin-presentation>`;
  }
}

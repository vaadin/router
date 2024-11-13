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

import htmlCode4 from './d4/iframe.html?snippet';
import tsCode4 from './d4/script.js?snippet';

import css from '@helpers/page.css?ctr';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-navigation-trigger': DemoNavigationTrigger;
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
    title: 'script.js',
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
    title: 'script.js',
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
    title: 'script.js',
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
    title: 'script.js',
  },
];

@customElement('vaadin-demo-navigation-trigger')
export default class DemoNavigationTrigger extends LitElement {
  static override styles = [css];

  override render(): TemplateResult {
    return html`<h3>Navigation Triggers</h3>
      <p class="note">This feature is for advanced use cases. Please make sure to read the documentation carefully.</p>
      <p>
        There are several events that can trigger in-app navigation with Vaadin Router: popstate events, clicks on the
        <code>&lt;a&gt;</code> elements, imperative navigation triggered by JavaScript. In order to make a flexible
        solution that can be tweaked to particular app needs and remain efficient, Vaadin Router has a concept of
        pluggable <em>Navigation Triggers</em> that listen to specific browser events and convert them into the Vaadin
        Router navigation events.
      </p>
      <p>
        The <code>@vaadin/router</code> package comes with two Navigation Triggers bundled by default:
        <code>POPSTATE</code> and <code>CLICK</code>.
      </p>
      <p>
        Developers can define and use additional Navigation Triggers that are specific to their application. A
        Navigation Trigger object must have two methods: <code>activate()</code> to start listening on some UI events,
        and <code>inactivate()</code> to stop.
      </p>

      <h3><code>NavigationTrigger.POPSTATE</code></h3>
      <p>
        The default <code>POPSTATE</code> navigation trigger for Vaadin Router listens to <code>popstate</code> events
        on the current <code>window</code> and for each of them dispatches a navigation event for Vaadin Router using
        the current <code>window.location.pathname</code> as the navigation target. This allows using the browser
        Forward and Back buttons for in-app navigation.
      </p>
      <p>
        In the demo below the <code>popstate</code> events are dispatched at 3 seconds intervals. Before dispatching an
        event the global <code> location.pathname</code> is toggled between '/' and '/users'.
      </p>
      <p>
        Please note that when using the <code>window.history.pushState()</code> or
        <code>window.history.replaceState()</code> methods, you need to dispatch the <code>popstate</code> event
        manually&mdash;these methods do not do that by themselves (see
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API" target="_blank" rel="noopener">MDN</a>
        for details).
      </p>
      <vaadin-presentation src="./d1/iframe.html">
        <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3><code>NavigationTrigger.CLICK</code></h3>
      <p>
        The <code>CLICK</code> navigation trigger intercepts clicks on <code>&lt;a&gt;</code> elements on the the page
        and converts them into navigation events for Vaadin Router if they refer to a location within the app. That
        allows using regular <code>&lt;a&gt;</code> link elements for in-app navigation. You can use
        <code>router-ignore</code>
        attribute to have the router ignore the link.
      </p>
      <vaadin-presentation src="./d2/iframe.html">
        <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Custom Navigation Triggers</h3>
      <p>
        The set of default navigation triggers can be changed using the <code> Router.setTriggers()</code> static
        method. It accepts zero, one or more <code>NavigationTrigger</code>s.
      </p>
      <p>
        This demo shows how to disable the <code>CLICK</code> navigation trigger. It may be useful when the app has an
        own custom element for in-app links instead of using the regular <code>&lt;a&gt;</code> elements for that
        purpose. The demo also shows a very basic version of a custom in-app link element based on a list element that
        fires <code>popstate</code> events when clicked.
      </p>
      <p>
        Note: if the default Navigation Triggers are not used by the app, they can be excluded from the app bundle to
        avoid sending unnecessary code to the users. See <code>src/router-config.js</code> for details.
      </p>
      <vaadin-presentation src="./d3/iframe.html">
        <vaadin-demo-code-snippet .files=${files3}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Unsubscribe from Navigation Events</h3>
      <p>
        Each Vaadin Router instance is automatically subscribed to navigation events upon creation. Sometimes it might
        be necessary to cancel this subscription so that the router would re-render only in response to the explicit
        <code>render()</code> method calls. Use the <code>unsubscribe() </code> method to cancel this automatic
        subscription and the <code> subscribe()</code> method to re-subscribe.
      </p>
      <vaadin-presentation src="./d4/iframe.html">
        <vaadin-demo-code-snippet .files=${files4}></vaadin-demo-code-snippet>
      </vaadin-presentation>`;
  }
}

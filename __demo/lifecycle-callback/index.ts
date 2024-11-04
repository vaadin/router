/* eslint-disable import/no-duplicates, import/default */
import '@helpers/vaadin-demo-layout.js';
import '@helpers/vaadin-demo-code-snippet.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import htmlCode1 from './d1/iframe.html?snippet';
import url1 from './d1/iframe.html?url';
import tsCode1 from './d1/script.js?snippet';
import xCountdownCode from './d1/x-countdown.js?snippet';

import htmlCode2 from './d2/iframe.html?snippet';
import url2 from './d2/iframe.html?url';
import tsCode2 from './d2/script.js?snippet';
import xFriend from './d2/x-friend.js?snippet';

import htmlCode3 from './d3/iframe.html?snippet';
import url3 from './d3/iframe.html?url';
import tsCode3 from './d3/script.js?snippet';
import xUserDeleted from './d3/x-user-deleted.js?snippet';
import xUserManage from './d3/x-user-manage.js?snippet';

import htmlCode4 from './d4/iframe.html?snippet';
import url4 from './d4/iframe.html?url';
import tsCode4 from './d4/script.js?snippet';
import xAutosaveView from './d4/x-autosave-view.js?snippet';
import xMainPage from './d4/x-main-page.js?snippet';

import htmlCode5 from './d5/iframe.html?snippet';
import url5 from './d5/iframe.html?url';
import tsCode5 from './d5/script.js?snippet';

import onAfterEnterCode from './my-view-with-after-enter.ts?snippet';
import onAfterLeaveCode from './my-view-with-after-leave.ts?snippet';
import onBeforeEnterCode from './my-view-with-before-enter.ts?snippet';
import onBeforeLeaveCode from './my-view-with-before-leave.ts?snippet';

import theme from '@helpers/theme.js';
import type { CodeSnippet } from '@helpers/vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-lifecycle-callback': DemoLifecycleCallback;
  }
}

const files1: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode1[0],
    title: 'iframe1.html',
  },
  {
    id: 'ts',
    code: tsCode1[0],
    title: 'script1.ts',
  },
  {
    id: 'x-countdown',
    code: xCountdownCode[0],
    title: 'x-countdown.ts',
  },
];

const files2: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode2[0],
    title: 'iframe2.html',
  },
  {
    id: 'ts',
    code: tsCode2[0],
    title: 'script2.ts',
  },
  {
    id: 'x-friend',
    code: xFriend[0],
    title: 'x-friend.ts',
  },
];

const files3: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode3[0],
    title: 'iframe3.html',
  },
  {
    id: 'ts',
    code: tsCode3[0],
    title: 'script3.ts',
  },
  {
    id: 'x-user-deleted',
    code: xUserDeleted[0],
    title: 'x-user-deleted.ts',
  },
  {
    id: 'x-user-manage',
    code: xUserManage[0],
    title: 'x-user-manage.ts',
  },
];

const files4: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode4[0],
    title: 'iframe4.html',
  },
  {
    id: 'ts',
    code: tsCode4[0],
    title: 'script4.ts',
  },
  {
    id: 'x-autosave-view',
    code: xAutosaveView[0],
    title: 'x-autosave-view.ts',
  },
  {
    id: 'x-main-page',
    code: xMainPage[0],
    title: 'x-main-page.ts',
  },
];

const files5: readonly CodeSnippet[] = [
  {
    id: 'html',
    code: htmlCode5[0],
    title: 'iframe5.html',
  },
  {
    id: 'ts',
    code: tsCode5[0],
    title: 'script5.ts',
  },
];

@customElement('vaadin-demo-lifecycle-callback')
@theme
export default class DemoLifecycleCallback extends LitElement {
  override render(): TemplateResult {
    return html`<h3>Lifecycle Callbacks</h3>
      <p>
        Vaadin Router manages the lifecycle of all route Web Components.
        <em>Lifecycle callbacks</em> allow you to add custom logic to any point of this lifecycle:
      </p>
      <ul>
        <li>
          <b
            ><code>
              <a target="_parent" href="..#/classes/WebComponentInterface#method-onBeforeEnter">
                onBeforeEnter(location, commands, router)</a
              >: Promise | Prevent | Redirect | void</code
            ></b
          >
        </li>
        <li>
          <b
            ><code>
              <a target="_parent" href="..#/classes/WebComponentInterface#method-onAfterEnter">
                onAfterEnter(location, commands, router)</a
              >: void</code
            ></b
          >
        </li>
        <li>
          <b
            ><code>
              <a target="_parent" href="..#/classes/WebComponentInterface#method-onBeforeLeave">
                onBeforeLeave(location, commands, router)</a
              >: Promise | Prevent | void
            </code></b
          >
        </li>
        <li>
          <b
            ><code>
              <a target="_parent" href="..#/classes/WebComponentInterface#method-onAfterLeave">
                onAfterLeave(location, commands, router)</a
              >: void</code
            ></b
          >
        </li>
        <hr />
        <li>
          the <code>'vaadin-router-location-changed'</code> / <code>'vaadin-router-error'</code> events on the
          <code>window</code>
        </li>
      </ul>
      <p>
        Vaadin Router lifecycle callbacks can be defined as methods on the route Web Component
        <a
          href="https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-definition"
          target="_blank"
          rel="noopener"
          >class definition</a
        >
        in a similar way as the native custom element callbacks (like <code>disconnectedCallback()</code>).
      </p>

      <h3><code>onBeforeEnter(location, commands, router)</code></h3>
      <p>
        The component's route has matched the current path, an instance of the component has been created and is about
        to be inserted into the DOM. Use this callback to create a route guard (e.g. redirect to the login page if the
        user is not logged in).
      </p>
      <p>
        At this point there is yet
        <strong>no guarantee that the navigation into this view will actually happen</strong> because another route's
        callback may interfere.
      </p>
      <p>
        This callback may return a <em>redirect</em> (<code>return commands.redirect('/new/path')</code>) or a
        <em>prevent</em> (<code>return commands.prevent()</code>) router command. If it returns a promise, the router
        waits until the promise is resolved before proceeding with the navigation.
      </p>
      <p>
        See the
        <a target="_parent" href="../#/classes/WebComponentInterface#method-onBeforeEnter"> API documentation</a> for
        more details.
      </p>
      <p>
        <strong>Note: </strong>Navigating to the same route also triggers this callback, e.g., click on the same link
        multiple times will trigger the <code>onBeforeEnter</code>
        callback on each click.
      </p>
      <vaadin-presentation src=${url1}>
        <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3><code>onAfterEnter(location, commands, router)</code></h3>
      <p>
        The component's route has matched the current path and an instance of the component has been rendered into the
        DOM. At this point it is certain that navigation won't be prevented or redirected. Use this callback to process
        route params and initialize the view so that it's ready for user interactions.
      </p>
      <p>
        NOTE: When navigating between views the <code>onAfterEnter</code> callback on the new view's component is called
        <em>before</em> the <code>onAfterLeave</code> callback on the previous view's component (which is being
        removed). At some point both the new and the old view components are present in the DOM to allow
        <a href="#vaadin-router-animated-transitions-demos">animating</a> the transition (you can listen to the
        <code>animationend</code> event to detect when it is over).
      </p>
      <p>
        Any value returned from this callback is ignored. See the
        <a target="_parent" href="../#/classes/WebComponentInterface#method-onAfterEnter"> API documentation</a> for
        more details.
      </p>
      <vaadin-presentation src=${url2}>
        <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3><code>onBeforeLeave(location, commands, router)</code></h3>
      <p>
        The component's route does not match the current path anymore and the component is about to be removed from the
        DOM. Use this callback to prevent the navigation if necessary like in the demo below. Note that the user is
        still able to copy and open that URL manually in the browser.
      </p>
      <p>
        Even if this callback does not prevent the navigation, at this point there is yet
        <strong>no guarantee that the navigation away from this view will actually happen</strong> because another
        route's callback may also interfere.
      </p>
      <p>
        This callback may return a <em>prevent</em> (<code>return commands.prevent()</code>) router command. If it
        returns a promise, the router waits until the promise is resolved before proceeding with the navigation.
      </p>
      <p>
        See the
        <a target="_parent" href="../#/classes/WebComponentInterface#method-onBeforeLeave"> API documentation</a> for
        more details.
      </p>
      <p>
        <strong>Note: </strong>Navigating to the same route also triggers this callback, e.g., click on the same link
        multiple times will trigger the <code>onBeforeLeave</code>
        callback on each click.
      </p>
      <vaadin-presentation src=${url3}>
        <vaadin-demo-code-snippet .files=${files3}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3><code>onAfterLeave(location, commands, router)</code></h3>
      <p>
        The component's route does not match the current path anymore and the component's removal from the DOM has been
        started (it will be removed after a transition animation, if any). At this point it is certain that navigation
        won't be prevented. Use this callback to clean-up and perform any custom actions that leaving a view should
        trigger. For example, the demo below auto-saves any unsaved changes when the user navigates away from the view.
      </p>
      <p>
        NOTE: When navigating between views the <code>onAfterEnter</code> callback on the new view's component is called
        <em>before</em> the <code>onAfterLeave</code> callback on the previous view's component (which is being
        removed). At some point both the new and the old view components are present in the DOM to allow
        <a href="#vaadin-router-animated-transitions-demos">animating</a> the transition (you can listen to the
        <code>animationend</code> event to detect when it is over).
      </p>
      <p>
        Any value returned from this callback is ignored. See the
        <a target="_parent" href="../#/classes/WebComponentInterface#method-onAfterLeave"> API documentation</a> for
        more details.
      </p>
      <vaadin-presentation src=${url4}>
        <vaadin-demo-code-snippet .files=${files4}></vaadin-demo-code-snippet>
      </vaadin-presentation>

      <h3>Listen to Global Navigation Events</h3>
      <p>
        In order to react to route changes in other parts of the app (outside of route components), you can add an event
        listener for the <code> vaadin-router-location-changed</code> events on the <code>window</code>. Vaadin Router
        dispatches such events every time after navigating to a new path.
      </p>
      <vaadin-presentation src=${url5}>
        <vaadin-demo-code-snippet .files=${files5}></vaadin-demo-code-snippet>
      </vaadin-presentation>
      <p>
        In case if navigation fails for any reason (e.g. if no route matched the given pathname), instead of the
        <code>vaadin-router-location-changed</code> event Vaadin Router dispatches <code>vaadin-router-error</code> and
        attaches the error object to the event as <code>event.detail.error</code>.
      </p>

      <h3>Getting the Current Location</h3>
      <p>
        When handling Vaadin Router events, you can access the router instance via
        <code>event.detail.router</code>, and the current location via <code> event.detail.location</code> (which is a
        shorthand for <code>event.detail.router.location</code>). The
        <a target="_parent" href="..#/classes/Router.Location"><code>location</code></a>
        object has all details about the current router state. For example,
        <code>location.routes</code> is a read-only list of routes that correspond to the last completed navigation,
        which may be useful for example when creating a breadcrumbs component to visualize the current in-app location.
      </p>

      <p>
        The router configuration allows you to add any custom properties to route objects. The example above uses that
        to set a custom <code>xBreadcrumb</code> property on the routes that we want to show up in breadcrumbs. That
        property is used later when processing the <code>vaadin-router-location-changed </code> events.
      </p>

      <h3>TypeScript Interfaces</h3>
      <p>
        For using with components defined as TypeScript classes, the following interfaces are available for
        implementing:
      </p>
      <ul>
        <li>
          <p>
            <b><code>BeforeEnterObserver</code></b>
          </p>
          <vaadin-demo-code-snippet .files=${[{ code: onBeforeEnterCode[0] }]}></vaadin-demo-code-snippet>
        </li>
        <li>
          <p>
            <b><code>AfterEnterObserver</code></b>
          </p>
          <vaadin-demo-code-snippet .files=${[{ code: onAfterEnterCode[0] }]}></vaadin-demo-code-snippet>
        </li>
        <li>
          <p>
            <b><code>BeforeLeaveObserver</code></b>
          </p>
          <vaadin-demo-code-snippet .files=${[{ code: onBeforeLeaveCode[0] }]}></vaadin-demo-code-snippet>
        </li>
        <li>
          <p>
            <b><code>AfterLeaveObserver</code></b>
          </p>
          <vaadin-demo-code-snippet .files=${[{ code: onAfterLeaveCode[0] }]}></vaadin-demo-code-snippet>
        </li>
      </ul>`;
  }
}

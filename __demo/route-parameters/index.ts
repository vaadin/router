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
    'vaadin-demo-animated-transitions': DemoAnimatedTransitions;
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

@customElement('vaadin-demo-animated-transitions')
export default class DemoAnimatedTransitions extends LitElement {
  override render(): TemplateResult {
    return html`<p>
        Vaadin Router allows you to animate transitions between routes. In order to add an animation, do the next steps:
      </p>
      <ol>
        <li>update the router config: add the <code>animate</code> property set to <code>true</code></li>
        <li>add <code>@keyframes</code> animations, either in the view Web Component styles or in outside CSS</li>
        <li>apply CSS for <code>.leaving</code> and <code>.entering</code> classes to use the animations</li>
      </ol>
      <p>
        The demo below illustrates how to add the transition between all the routes in the same group. You might also
        add the transition for the specific routes only, by setting the <code>animate</code>
        property on the corresponding route config objects.
      </p>
      <vaadin-presentation src=${url1}>
        <vaadin-demo-code-snippet .files=${files1}></vaadin-demo-code-snippet>
      </vaadin-presentation>
      <p>To run the animated transition, Vaadin Router performs the actions in the following order:</p>
      <ol>
        <li>render the new view component to the outlet content</li>
        <li>set the <code>entering</code> CSS class on the new view component</li>
        <li>set the <code>leaving</code> CSS class on the old view component, if any</li>
        <li>check if some <code>@keyframes</code> animation applies, and wait for it to complete</li>
        <li>remove the old view component from the outlet content</li>
        <li>continue the remaining navigation steps as usual</li>
      </ol>
      <h3>Customize CSS Classes</h3>
      <p>
        In the basic use case, using single type of the animated transition could be enough to make the web app looking
        great, but often we need to configure it depending on the route. Vaadin Router supports this feature by setting
        object value to <code>animate</code> property, with the <code>enter</code> and <code>leave</code> string keys.
        Their values are used for setting CSS classes to be set on the views.
      </p>
      <p>
        Note that you can first configure animated transition for the group of routes, and then override it for the
        single route. In particular, you can switch back to using default CSS classes, as shown in the demo below.
      </p>
      <vaadin-presentation src=${url2}>
        <vaadin-demo-code-snippet .files=${files2}></vaadin-demo-code-snippet>
      </vaadin-presentation>`;
  }
}

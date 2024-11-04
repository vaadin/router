import '@vaadin/app-layout';
import '@vaadin/app-layout/vaadin-drawer-toggle.js';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/scroller';
import '@vaadin/side-nav';
import '@vaadin/side-nav/vaadin-side-nav-item.js';
import { SignalWatcher } from '@lit-labs/preact-signals';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './vaadin-presentation.js';
import theme from './theme.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-layout': DemoLayout;
  }
}

@customElement('vaadin-demo-layout')
@theme
export default class DemoLayout extends SignalWatcher(LitElement) {
  @property({ attribute: 'app-title', type: String }) accessor appTitle = '';

  override render(): TemplateResult {
    return html` <vaadin-app-layout primary-section="drawer">
      <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
      <h1 slot="navbar">${this.appTitle}</h1>
      <main>
        <slot></slot>
      </main>
      <vaadin-scroller slot="drawer" class="p-s">
        <vaadin-side-nav>
          <vaadin-side-nav-item path="/getting-started/">Getting Started</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/code-splitting/">Code Splitting</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/animated-transitions/">Animated Transitions</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/lifecycle-callback/">Lifecycle Callback</vaadin-side-nav-item>
        </vaadin-side-nav>
      </vaadin-scroller>
    </vaadin-app-layout>`;
  }
}

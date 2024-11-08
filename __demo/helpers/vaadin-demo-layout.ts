/* eslint-disable @typescript-eslint/unbound-method */
import '@vaadin/app-layout';
import '@vaadin/app-layout/vaadin-drawer-toggle.js';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/scroller';
import '@vaadin/side-nav';
import '@vaadin/side-nav/vaadin-side-nav-item.js';
import { SignalWatcher } from '@lit-labs/preact-signals';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './vaadin-presentation.js';
import css from './vaadin-demo-layout.css?ctr';

const colorScheme = window.localStorage.getItem('color-scheme');
if (colorScheme) {
  document.documentElement.setAttribute('theme', colorScheme);
}

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-layout': DemoLayout;
  }
}

@customElement('vaadin-demo-layout')
export default class DemoLayout extends SignalWatcher(LitElement) {
  static override styles = [css];

  @property({ attribute: 'app-title', type: String }) accessor appTitle = '';
  @state() accessor #mode = document.documentElement.getAttribute('theme') ?? 'light';

  override render(): TemplateResult {
    return html`<vaadin-app-layout primary-section="drawer">
      <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
      <header class="navbar" slot="navbar">
        <h1>${this.appTitle}</h1>
        <vaadin-button theme="icon" slot="navbar" aria-label="Toggle dark mode" @click=${this.#onToggleMode}>
          <vaadin-icon icon=${this.#mode === 'dark' ? 'vaadin:sun-o' : 'vaadin:moon-o'}></vaadin-icon>
        </vaadin-button>
      </header>
      <main>
        <slot></slot>
      </main>
      <vaadin-scroller slot="drawer">
        <vaadin-side-nav>
          <vaadin-side-nav-item path="/getting-started/">Getting Started</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/code-splitting/">Code Splitting</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/animated-transitions/">Animated Transitions</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/lifecycle-callback/">Lifecycle Callback</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/navigation-trigger/">Navigation Trigger</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/redirect/">Redirect</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/route-actions/">Route Actions</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/route-parameters/">Route Parameters</vaadin-side-nav-item>
          <vaadin-side-nav-item path="/url-generation/">URL Generations</vaadin-side-nav-item>
        </vaadin-side-nav>
      </vaadin-scroller>
    </vaadin-app-layout>`;
  }

  #onToggleMode() {
    this.#mode = this.#mode === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem('color-scheme', this.#mode);
    document.documentElement.setAttribute('theme', this.#mode);
    dispatchEvent(new Event('theme-changed'));
  }
}

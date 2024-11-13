/* eslint-disable import/no-duplicates, import/default */
import '@helpers/common.js';
import '@helpers/vaadin-presentation.js';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

// An URL of the iframe to debug
// eslint-disable-next-line import/order
import url1 from '../url-generation/d4/iframe.html?url';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-demo-debug': DemoDebug;
  }
}

@customElement('vaadin-demo-debug')
export default class DemoDebug extends LitElement {
  override render(): TemplateResult {
    return html`<vaadin-presentation src=${url1}></vaadin-presentation>`;
  }
}

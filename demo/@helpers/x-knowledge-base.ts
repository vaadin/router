import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation, WebComponentInterface } from '@vaadin/router';

@customElement('x-knowledge-base')
export class KnowledgeBase extends LitElement implements WebComponentInterface {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html` Knowledge base path: '${this.location?.params.path ?? 'unknown'}' `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-knowledge-base': KnowledgeBase;
  }
}

import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation } from '@vaadin/router';

declare global {
  interface HTMLElementTagNameMap {
    'x-project-view': ProjectView;
  }
}

@customElement('x-project-view')
export default class ProjectView extends LitElement {
  @property({ type: Object }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    return html`<h1>Project</h1>
      <p>ID: ${this.location?.params.id ?? 'unknown'}</p>
      <code>/project</code> or <code>/projects</code>: ${this.location?.params[0] ?? 'unknown'}`;
  }
}

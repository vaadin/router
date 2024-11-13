import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RouterLocation } from '../../../src/index.js';
import css from '@helpers/common.css?ctr';

declare global {
  interface HTMLElementTagNameMap {
    'x-user-js-bundle-view': UserJsBundleView;
  }
}

// tag::snippet[]
@customElement('x-user-js-bundle-view')
export default class UserJsBundleView extends LitElement {
  static override styles = css;
  @property({ attribute: false }) accessor location: RouterLocation | undefined;
  override render(): TemplateResult {
    return html`<h1>User JS Bundle</h1>
      <p>User id: <b>${this.location?.params.id}</b>. This view was loaded using JS bundle.</p>`;
  }
}
// end::snippet[]

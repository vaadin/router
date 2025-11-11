/* eslint-disable import/order, import/no-duplicates */
// tag::snippet[]
import type { RouterLocation } from '@vaadin/router';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { router } from './s2.js';

@customElement('my-view')
class MyViewElement extends LitElement {
  @property({ type: Object }) accessor location: RouterLocation = router.location;

  override render() {
    return html`Current location URL: ${this.location.getUrl()}`;
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'my-view': MyViewElement;
  }
}

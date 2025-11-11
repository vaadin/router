/* eslint-disable @typescript-eslint/no-unused-vars */
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
// tag::snippet[]
import type { PreventAndRedirectCommands, Router, RouterLocation, WebComponentInterface } from '@vaadin/router';

@customElement('my-view-with-before-enter')
export default class MyViewWithBeforeEnter extends LitElement implements WebComponentInterface {
  onBeforeEnter(location: RouterLocation, commands: PreventAndRedirectCommands, router: Router): void {
    // ...
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'my-view-with-before-enter': MyViewWithBeforeEnter;
  }
}

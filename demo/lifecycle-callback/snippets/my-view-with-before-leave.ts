/* eslint-disable @typescript-eslint/no-unused-vars */
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
// tag::snippet[]
import type { PreventCommands, Router, RouterLocation, WebComponentInterface } from '@vaadin/router';

@customElement('my-view-with-before-leave')
class MyViewWithBeforeLeave extends LitElement implements WebComponentInterface {
  onBeforeLeave(location: RouterLocation, commands: PreventCommands, router: Router) {
    // ...
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'my-view-with-before-leave': MyViewWithBeforeLeave;
  }
}

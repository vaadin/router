/* eslint-disable @typescript-eslint/no-unused-vars */
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
// tag::snippet[]
import type { EmptyCommands, Router, RouterLocation, WebComponentInterface } from '@vaadin/router';

@customElement('my-view-with-after-leave')
class MyViewWithAfterLeave extends LitElement implements WebComponentInterface {
  onAfterLeave(location: RouterLocation, commands: EmptyCommands, router: Router) {
    // ...
  }
}
// end::snippet[]

declare global {
  interface HTMLElementTagNameMap {
    'my-view-with-after-leave': MyViewWithAfterLeave;
  }
}

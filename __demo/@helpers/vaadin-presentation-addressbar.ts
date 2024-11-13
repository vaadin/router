/* eslint-disable @typescript-eslint/unbound-method */
import '@vaadin/button';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/text-field';
import '@vaadin/tooltip';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import css from './vaadin-presentation-addressbar.css?ctr';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-presentation-addressbar': PresentationAddressbar;
  }
}

@customElement('vaadin-presentation-addressbar')
export class PresentationAddressbar extends LitElement {
  static override styles = css;

  @property({ attribute: true, type: String }) accessor url: string | undefined;

  override render(): TemplateResult {
    return html`<vaadin-button theme="icon" aria-label="Back">
        <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
        <vaadin-tooltip slot="tooltip" text="Back"></vaadin-tooltip>
      </vaadin-button>
      <vaadin-button theme="icon" aria-label="Forward">
        <vaadin-icon icon="vaadin:arrow-right" aria-label="Forward"></vaadin-icon>
        <vaadin-tooltip slot="tooltip" text="Forward"></vaadin-tooltip>
      </vaadin-button>
      <vaadin-text-field value=${ifDefined(this.url)} @input=${this.#onChange}>
        <vaadin-icon slot="prefix" icon="vaadin:lock"></vaadin-icon>
      </vaadin-text-field>`;
  }

  #onChange(event: Event) {
    this.url = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent<string>('url-changed', { detail: this.url }));
  }
}

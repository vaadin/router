/* eslint-disable @typescript-eslint/unbound-method */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { WebComponentInterface } from '../../../src/types.t.js';

let savedText = 'This text is automatically saved when router navigates away.';

@customElement('x-autosave-view')
export class AutosaveView extends LitElement implements WebComponentInterface {
  @state() accessor #text = savedText;

  override render(): TemplateResult {
    return html`
      <div>
        <textarea rows="5" cols="30" .value="${this.#text}" @input="${this.onInput}"></textarea>
      </div>
      <a href="/">Stop editing</a>
    `;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.#text = target.value;
  }

  onAfterEnter(): void {
    this.#text = savedText;
  }

  onAfterLeave(): void {
    savedText = this.#text;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-autosave-view': AutosaveView;
  }
}

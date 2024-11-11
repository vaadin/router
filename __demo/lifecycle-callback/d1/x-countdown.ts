import { html, LitElement, render, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterLocation, WebComponentInterface } from '../../../src/types.t.js';

@customElement('x-countdown')
export default class Countdown extends LitElement implements WebComponentInterface {
  readonly #home = document.body.querySelector('x-home-view');
  #count = 0;
  #timer?: ReturnType<typeof setInterval>;

  override render(): TemplateResult {
    return html`<h1>Go-go-go!</h1>`;
  }

  async onBeforeEnter(_: RouterLocation): Promise<void> {
    this.#count = 3;
    this.#tick();
    return await new Promise<void>((resolve) => {
      this.#timer = setInterval(() => {
        if (this.#count < 0) {
          this.#clear();
          resolve();
        } else {
          this.#tick();
        }
      }, 500);
    });
  }

  #tick(): void {
    if (this.#home) {
      render(html`<h2>${this.#count}</h2>`, this.#home);
    }

    this.#count -= 1;
  }

  #clear(): void {
    if (this.#home) {
      render(html``, this.#home);
    }
    clearInterval(this.#timer);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-countdown': Countdown;
  }
}

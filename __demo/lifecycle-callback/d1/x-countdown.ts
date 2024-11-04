import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterLocation, WebComponentInterface } from '../../../src/types.t.js';

@customElement('x-countdown')
export default class Countdown extends LitElement implements WebComponentInterface {
  count = 0;
  timer?: ReturnType<typeof setInterval>;

  override render(): TemplateResult {
    return html`<h1>Go-go-go!</h1>`;
  }

  async onBeforeEnter(_: RouterLocation): Promise<void> {
    this.count = 3;
    this.tick();
    return await new Promise<void>((resolve) => {
      this.timer = setInterval(() => {
        if (this.count < 0) {
          this.clear();
          resolve();
        } else {
          this.tick();
        }
      }, 500);
    });
  }

  tick(): void {
    let h2 = document.body.querySelector('h2');
    if (!h2) {
      h2 = document.createElement('h2');
      h2.setAttribute('style', 'position: absolute; top: 80px');
      document.body.appendChild(h2);
    }
    h2.textContent = String(this.count);
    this.count -= 1;
  }

  clear(): void {
    const h2 = document.body.querySelector('h2');
    if (h2) {
      document.body.removeChild(h2);
    }
    clearInterval(this.timer);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-countdown': Countdown;
  }
}

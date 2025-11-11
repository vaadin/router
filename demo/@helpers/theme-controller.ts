import type { ReactiveController, ReactiveControllerHost } from 'lit';

export default class ThemeController implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  #controller?: AbortController;

  constructor(host: ReactiveControllerHost) {
    (this.#host = host).addController(this);
  }

  get value(): string {
    return document.documentElement.getAttribute('theme') ?? 'light';
  }

  hostConnected(): void {
    this.#controller = new AbortController();
    addEventListener('theme-changed', () => this.#host.requestUpdate(), { signal: this.#controller.signal });
  }

  hostDisconnected(): void {
    this.#controller?.abort();
  }
}

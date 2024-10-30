/* eslint-disable @typescript-eslint/unbound-method */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import theme from './theme.js';
import css from './vaadin-presentation.css?ctr';
import './vaadin-presentation-addressbar.js';
import './vaadin-demo-code-snippet.js';

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-presentation': VaadinPresentation;
  }
}

type MessageData = Readonly<{
  url: string;
}>;

@customElement('vaadin-presentation')
@theme
export default class VaadinPresentation extends LitElement {
  static override styles = css;

  @property() accessor src: string | undefined;
  @property({ attribute: true, type: String }) accessor url: string | undefined;
  #controller?: AbortController;
  #window?: Window;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#controller = new AbortController();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#controller?.abort();
  }

  override firstUpdated(): void {
    if (this.#controller) {
      addEventListener(
        'message',
        ({ data, origin, source }: MessageEvent<MessageData>) => {
          if (origin === 'null' && source === this.#window) {
            this.url = new URL(data.url).pathname;
          }
        },
        { signal: this.#controller.signal },
      );
    }
  }

  changedProperties(map: PropertyValues<this>): void {
    if (map.has('url')) {
      this.#window?.postMessage({ url: this.url }, '*');
    }
  }

  override render(): TemplateResult {
    return html`<vaadin-presentation-addressbar
        url=${ifDefined(this.url)}
        @url-changed=${this.#onUrlChanged}
      ></vaadin-presentation-addressbar>
      <iframe
        id="browser"
        src=${ifDefined(this.src)}
        sandbox="allow-scripts"
        @load=${(event: Event) => {
          this.#window = (event.target as HTMLIFrameElement).contentWindow!;
          this.#window.postMessage(null, '*');
        }}
      ></iframe>
      <slot></slot>`;
  }

  #onUrlChanged(event: CustomEvent<string>) {
    this.url = new URL(event.detail, location.origin).pathname;
    this.#window?.postMessage({ url: this.url }, '*');
  }
}

import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { RouterLocation } from '../../src/index.js';
import commonCss from './common.css?ctr';
import theme from './theme.js';
import css from './x-image-view.css?ctr';

declare global {
  interface HTMLElementTagNameMap {
    'x-image-view': ImageView;
  }
}

@customElement('x-image-view')
@theme
export default class ImageView extends LitElement {
  static override styles = [commonCss, css];

  @property({ attribute: false }) accessor location: RouterLocation | undefined;

  override render(): TemplateResult {
    const size = this.location?.params.size as number | undefined;
    const color = this.location?.params.color as string | undefined;

    return html`<div
      class="img-view"
      style=${styleMap({
        '--x-image-view-width': `${size}px`,
        '--x-image-view-height': `${size}px`,
        '--x-image-view-background-color': color,
      })}
    ></div>`;
  }
}

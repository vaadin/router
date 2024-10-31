import { CSSResult, type LitElement } from 'lit';
import type { Constructor } from 'type-fest';
// import * as styles from './lumo-theme.js';

export function applyTheme(container: Document | ShadowRoot): void {
  // for (const value of Object.values(styles)) {
  //   if (value instanceof CSSResult && value.styleSheet) {
  //     container.adoptedStyleSheets.push(value.styleSheet);
  //   } else if (Array.isArray(value)) {
  //     for (const sheet of value.map(({ styleSheet }) => styleSheet).filter((s) => s != null)) {
  //       container.adoptedStyleSheets.push(sheet);
  //     }
  //   }
  // }
}

export default function theme<T extends Constructor<LitElement>>(klass: T, _: ClassDecoratorContext<T>): T {
  return class ThemedClass extends klass {
    override connectedCallback(): void {
      super.connectedCallback();

      // if (this.shadowRoot) {
      //   applyTheme(this.shadowRoot);
      // }
    }
  };
}

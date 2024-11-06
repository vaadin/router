/* eslint-disable import/unambiguous */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

declare module '*.css?ctr' {
  const css: CSSStyleSheet;
  export default css;
}

declare module '*?snippet' {
  import type { TemplateResult } from 'lit';

  const snippets: [code: string, full: TemplateResult, ...rest: TemplateResult[]];
  export default snippets;
}

/* eslint-disable import/unambiguous */

declare module 'regexp.escape/auto';

interface RegExpConstructor {
  escape(str: string): string;
}

declare module 'postcss-nested-import' {
  import type { Processor } from 'postcss';

  function plugin(): Processor;
  export = plugin;
}

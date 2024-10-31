/* eslint-disable import/unambiguous */

declare module 'regexp.escape/auto';

interface RegExpConstructor {
  escape(str: string): string;
}

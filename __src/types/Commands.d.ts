import type { EmptyObject } from '@ausginer/router';
import type { PreventResult, RedirectResult } from './general.js';

export interface Commands {
  component<K extends keyof HTMLElementTagNameMap>(name: K): HTMLElementTagNameMap[K];
  component(name: string): HTMLElement;
  /**
   * Function that creates a special object that can be returned to abort
   * the current navigation and fall back to the last one. If there is no
   * existing one, an exception is thrown.
   */
  prevent(): PreventResult;
  redirect(path: string): RedirectResult;
}

export type EmptyCommands = EmptyObject;
export type PreventCommands = Pick<Commands, 'prevent'>;
export type PreventAndRedirectCommands = Pick<Commands, 'prevent' | 'redirect'>;

const $command = Symbol('command');

export function createCommand<C extends Omit<ComponentCommand, typeof $command>>(command: C): ComponentCommand;
export function createCommand<C extends Omit<PreventCommand, typeof $command>>(command: C): PreventCommand;
export function createCommand<C extends Omit<RedirectCommand, typeof $command>>(command: C): RedirectCommand;
export function createCommand(command: object): Command {
  return { ...command, [$command]: true };
}

export interface ComponentCommand extends Command {
  name: string;
}

export function isComponentCommand(command: unknown): command is ComponentCommand {
  return !!command && typeof command === 'object' && $command in command && 'name' in command;
}

export interface PreventCommand extends Command {
  cancel: true;
}

export function isPreventCommand(command: unknown): command is PreventCommand {
  return !!command && typeof command === 'object' && $command in command && 'cancel' in command;
}

export interface RedirectCommand extends Command {
  to: string;
}

export function isRedirectCommand(command: unknown): command is RedirectCommand {
  return !!command && typeof command === 'object' && $command in command && 'to' in command;
}

/**
 * @deprecated - Use {@link PreventCommand} instead
 */
export type PreventResult = PreventCommand;

/**
 * @deprecated - Use {@link RedirectCommand} instead
 */
export type RedirectResult = RedirectCommand;

export interface Commands {
  component(name: string): ComponentCommand;
  /**
   * Function that creates a special object that can be returned to abort
   * the current navigation and fall back to the last one. If there is no
   * existing one, an exception is thrown.
   */
  prevent(): PreventCommand;
  redirect(path: string): RedirectCommand;
}

export interface Command {
  [$command]: true;
}

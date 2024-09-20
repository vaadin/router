import type { NavigationTrigger } from '../types.js';
import CLICK from './click.js';
import POPSTATE from './popstate.js';

let triggers: readonly NavigationTrigger[] = [];

const DEFAULT_TRIGGERS = {
  CLICK,
  POPSTATE,
} as const;

export { DEFAULT_TRIGGERS };

export function setNavigationTriggers(newTriggers: readonly NavigationTrigger[]): void {
  triggers.forEach((trigger) => trigger.inactivate());

  newTriggers.forEach((trigger) => trigger.activate());

  triggers = newTriggers;
}

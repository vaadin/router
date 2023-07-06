import type { NavigationTrigger } from './types.js';

let triggers: readonly NavigationTrigger[] = [];

import CLICK from './click.js';
import POPSTATE from './popstate.js';

const DEFAULT_TRIGGERS = {
  CLICK,
  POPSTATE,
} as const;

export { DEFAULT_TRIGGERS };

export function setNavigationTriggers(newTriggers: readonly NavigationTrigger[]) {
  triggers.forEach((trigger) => trigger.inactivate());

  newTriggers.forEach((trigger) => trigger.activate());

  triggers = newTriggers;
}

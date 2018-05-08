import {createEventTarget} from './createEventTarget.js';

let triggersSet = new Set();
export const navigationEventsEmitter = createEventTarget();

export function setNavigationTriggers(...triggers) {
  const newTriggersSet = new Set();

  for (const trigger of triggers) {
    if (!triggersSet.has(trigger)) {
      trigger.addListener(triggerEventListener);
    }
    newTriggersSet.add(trigger);
  }

  for (const trigger of triggersSet) {
    if (!newTriggersSet.has(trigger)) {
      trigger.removeListener(triggerEventListener);
    }
  }

  triggersSet = newTriggersSet;
}

function triggerEventListener(event) {
  navigationEventsEmitter.dispatchEvent(event);
}

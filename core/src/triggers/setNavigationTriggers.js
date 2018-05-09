/**
 * @typedef NavigationTrigger
 * @type {object}
 * @property {function()} activate
 * @property {function()} inactivate
 */

/** @type {Array<NavigationTrigger>} */
let triggers = [];

export function setNavigationTriggers(newTriggers) {
  for (const trigger of triggers) {
    trigger.inactivate();
  }

  for (const trigger of newTriggers) {
    trigger.activate();
  }

  triggers = newTriggers;
}

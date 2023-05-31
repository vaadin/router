export type NavigationTrigger = Readonly<{
  activate(): void;
  inactivate(): void;
}>;

let triggers: ReadonlyArray<NavigationTrigger> = [];

export default function setNavigationTriggers(newTriggers: ReadonlyArray<NavigationTrigger>): void {
  triggers.forEach(trigger => trigger.inactivate());
  newTriggers.forEach(trigger => trigger.activate());
  triggers = newTriggers;
}

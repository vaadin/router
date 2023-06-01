import CLICK from './click.js';
import POPSTATE from './popstate.js';

export type NavigationTrigger = Readonly<{
  activate(): void;
  inactivate(): void;
}>;

const NavigationTrigger = {
  get CLICK() {
    return CLICK;
  },
  get POPSTATE() {
    return POPSTATE;
  }
};

export { NavigationTrigger };

import CLICK from './triggers/click.js';
import POPSTATE from './triggers/popstate.js';
import {Router} from './router.js';
Router.NavigationTrigger = {POPSTATE, CLICK};
export {Router};

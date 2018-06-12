import CLICK from './triggers/click.js';
import POPSTATE from './triggers/popstate.js';
import {Router} from './router.js';
import animate from './transitions/animate';
Router.NavigationTrigger = {POPSTATE, CLICK};
Router.Transitions = {animate};
export {Router};

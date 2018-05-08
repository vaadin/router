import {createEventTarget} from './createEventTarget.js';

export const POPSTATE = createEventTarget();
window.addEventListener('popstate',
  function vaadinRouterGlobalPopstateHandler(event) {
    const navEvent = new CustomEvent('vaadin-router-navigate',
      {detail: {pathname: window.location.pathname}});
    POPSTATE.dispatchEvent(navEvent);
  });

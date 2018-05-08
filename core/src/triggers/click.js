import {createEventTarget} from './createEventTarget.js';

export const CLICK = createEventTarget();
window.document.addEventListener('click',
  function vaadinRouterGlobalClickHandler(event) {
    // TODO (vlukashov): implement vaadinRouterGlobalClickHandler()
  });

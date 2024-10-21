import { fireRouterEvent } from '../utils.js';
import type { NavigationTrigger } from './types.js';

/* istanbul ignore next: coverage is calculated in Chrome, this code is for IE */
function getAnchorOrigin(anchor: HTMLAnchorElement) {
  // IE11: on HTTP and HTTPS the default port is not included into
  // window.location.origin, so won't include it here either.
  const { port, protocol } = anchor;
  const defaultHttp = protocol === 'http:' && port === '80';
  const defaultHttps = protocol === 'https:' && port === '443';
  const host =
    defaultHttp || defaultHttps
      ? anchor.hostname // does not include the port number (e.g. www.example.org)
      : anchor.host; // does include the port number (e.g. www.example.org:80)
  return `${protocol}//${host}`;
}

function getNormalizedNodeName(e: EventTarget): string | undefined {
  if (!(e instanceof Element)) {
    return undefined;
  }

  return e.nodeName.toLowerCase();
}

// TODO: Name correctly when the type purpose is known
type __Pathable = Readonly<{
  path?: readonly EventTarget[];
}>;

// The list of checks is not complete:
//  - SVG support is missing
//  - the 'rel' attribute is not considered
function vaadinRouterGlobalClickHandler(event: MouseEvent & __Pathable) {
  // ignore the click if the default action is prevented
  if (event.defaultPrevented) {
    return;
  }

  // ignore the click if not with the primary mouse button
  if (event.button !== 0) {
    return;
  }

  // ignore the click if a modifier key is pressed
  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  // find the <a> element that the click is at (or within)
  let anchorCandidate = event.target;
  const path = event instanceof MouseEvent ? event.composedPath() : ((event as __Pathable).path ?? []);

  // FIXME(web-padawan): `Symbol.iterator` used by webcomponentsjs is broken for arrays
  // example to check: `for...of` loop here throws the "Not yet implemented" error
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < path.length; i++) {
    const target = path[i];
    if ('nodeName' in target && (target as Element).nodeName.toLowerCase() === 'a') {
      anchorCandidate = target;
      break;
    }
  }

  while (anchorCandidate && anchorCandidate instanceof Node && getNormalizedNodeName(anchorCandidate) !== 'a') {
    anchorCandidate = anchorCandidate.parentNode;
  }

  // ignore the click if not at an <a> element
  if (!anchorCandidate || getNormalizedNodeName(anchorCandidate) !== 'a') {
    return;
  }

  const anchor = anchorCandidate as HTMLAnchorElement;

  // ignore the click if the <a> element has a non-default target
  if (anchor.target && anchor.target.toLowerCase() !== '_self') {
    return;
  }

  // ignore the click if the <a> element has the 'download' attribute
  if (anchor.hasAttribute('download')) {
    return;
  }

  // ignore the click if the <a> element has the 'router-ignore' attribute
  if (anchor.hasAttribute('router-ignore')) {
    return;
  }

  // ignore the click if the target URL is a fragment on the current page
  if (anchor.pathname === window.location.pathname && anchor.hash !== '') {
    return;
  }

  // ignore the click if the target is external to the app
  // In IE11 HTMLAnchorElement does not have the `origin` property
  const origin = anchor.origin || getAnchorOrigin(anchor);
  if (origin !== window.location.origin) {
    return;
  }

  // if none of the above, convert the click into a navigation event
  if (fireRouterEvent('go', { path: new URL(anchor.href) }) && event instanceof MouseEvent) {
    event.preventDefault();
    // for a click event, the scroll is reset to the top position.
    // FIXME: undefined here?
    if (event.type === 'click') {
      window.scrollTo(0, 0);
    }
  }
}

/**
 * A navigation trigger for Vaadin Router that translated clicks on `<a>` links
 * into Vaadin Router navigation events.
 *
 * Only regular clicks on in-app links are translated (primary mouse button, no
 * modifier keys, the target href is within the app's URL space).
 */
const CLICK: NavigationTrigger = {
  activate() {
    window.document.addEventListener('click', vaadinRouterGlobalClickHandler);
  },

  inactivate() {
    window.document.removeEventListener('click', vaadinRouterGlobalClickHandler);
  },
};

export default CLICK;

import {Router, Resolver} from './index.js';

let isUrlAvailable, urlDocument, urlBase, urlAnchor;

Resolver.__ensureUrlAvailableOrPolyfilled = () => {
  if (isUrlAvailable === undefined) {
    try {
      const url = new URL('b', 'http://a');
      url.pathname = 'c';
      isUrlAvailable = (url.href === 'http://a/c');
    } catch (e) {
      isUrlAvailable = false;
    }

    if (!isUrlAvailable) {
      // The URL constructor is not available in IE11. Polyfill it by creating
      // an HTMLAnchorElement in an in-memory HTML document.
      urlDocument = document.implementation.createHTMLDocument('url');
      urlBase = urlDocument.createElement('base');
      urlDocument.head.appendChild(urlBase);
      urlAnchor = urlDocument.createElement('a');

      if (!urlAnchor.origin) {
        // IE11: HTMLAnchorElement does not have the `origin` property
        Object.defineProperty(urlAnchor, 'origin', {
          get: () => {
            // IE11: on HTTP and HTTPS the default port is not included into
            // window.location.origin, so won't include it here either.
            const protocol = urlAnchor.protocol;
            const port = urlAnchor.port;
            const defaultHttp = protocol === 'http:' && port === '80';
            const defaultHttps = protocol === 'https:' && port === '443';
            const host = (defaultHttp || defaultHttps)
              ? urlAnchor.hostname
              : urlAnchor.host;
            return `${protocol}//${host}`;
          }
        });

        // IE11: HTMLAnchorElement pathname does not start with a leading slash
        const getPathnameOrig = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(urlAnchor),
          'pathname'
        ).get;
        Object.defineProperty(urlAnchor, 'pathname', {
          get: () => {
            const pathname = getPathnameOrig.apply(urlAnchor);
            return pathname.charAt(0) !== '/'
              ? '/' + pathname
              : pathname;
          }
        });
      }
    }
  }
};

Resolver.__createUrl = (path, base) => {
  Resolver.__ensureUrlAvailableOrPolyfilled();
  if (isUrlAvailable) {
    return new URL(path, base);
  }

  urlBase.href = base;
  urlAnchor.href = path.replace(/ /g, '%20');
  // IE11: only absolute href setting results in correct part properties
  // (`protocol`, `host`, `port`, and such), otherwise they are empty.
  urlAnchor.href = urlAnchor.href; // eslint-disable-line no-self-assign
  return urlAnchor;
};

export {Router, Resolver};

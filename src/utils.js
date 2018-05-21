export function toArray(objectOrArray) {
  objectOrArray = objectOrArray || [];
  return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
}

export function ensureRoute(route) {
  if (!route || typeof route.path !== 'string') {
    const message = 'the `routes` parameter of Vaadin Router should be an object '
     + 'with a `path` string property or an array of such objects';
    throw new Error(message);
  }
  if (route.component && route.action) {
    throw new Error('Route object cannot have both `component` and `action` parameters defined');
  }
  if (route.bundle && (typeof route.bundle !== 'string' || !route.bundle.match(/.+\.[m]?js$/))) {
    throw new Error(`Route bundle '${route.bundle}' has undefined type: should be either '.js' or '.mjs' file.`);
  }
}

export function ensureRoutes(routes) {
  toArray(routes).forEach(route => ensureRoute(route));
}

export function loadBundle(path) {
  return new Promise((resolve, reject) => {
    loadEsModule(path).then(resolve).catch(e => reject(e));
  });
}

// TODO replace this with dynamic import after https://github.com/vaadin/vaadin-router/issues/34 is done
function loadEsModule(path) {
  let script = document.head.querySelector('script[src="' + path + '"][async]');
  if (script && script.parentNode === document.head) {
    if (script.__dynamicImportLoaded) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        const originalOnLoad = script.onload;
        script.onreadystatechange = script.onload = e => {
          originalOnLoad();
          resolve(e);
        };

        const originalOnError = script.onerror;
        script.onerror = e => {
          originalOnError();
          reject(e);
        };
      });
    }
  }
  return new Promise((resolve, reject) => {
    script = document.createElement('script');
    script.setAttribute('src', path);
    script.setAttribute('type', 'module');
    script.async = true;
    script.onreadystatechange = script.onload = e => {
      script.__dynamicImportLoaded = true;
      resolve(e);
    };
    script.onerror = e => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(e);
    };
    document.head.appendChild(script);
  });
}

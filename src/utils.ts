export function toArray(objectOrArray) {
  objectOrArray = objectOrArray || [];
  return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
}

export function log(msg) {
  return `[Vaadin.Router] ${msg}`;
}

export function logValue(value) {
  if (typeof value !== 'object') {
    return String(value);
  }

  const stringType = Object.prototype.toString.call(value).match(/ (.*)\]$/)[1];
  if (stringType === 'Object' || stringType === 'Array') {
    return `${stringType} ${JSON.stringify(value)}`;
  } else {
    return stringType;
  }
}

export function ensureRoute(route) {
  if (!route || !isString(route.path)) {
    throw new Error(
      log(`Expected route config to be an object with a "path" string property, or an array of such objects`)
    );
  }

  const stringKeys = ['component', 'redirect'];
  if (
    !isFunction(route.action) &&
    !Array.isArray(route.children) &&
    !isFunction(route.children) &&
    !stringKeys.some(key => isString(route[key]))
  ) {
    throw new Error(
      log(
        `Expected route config "${route.path}" to include either "${stringKeys.join('", "')}" ` +
        `or "action" function but none found.`
      )
    );
  }

  if (route.redirect) {
    ['component'].forEach(overriddenProp => {
      if (overriddenProp in route) {
        console.warn(
          log(
            `Route config "${route.path}" has both "redirect" and "${overriddenProp}" properties, ` +
            `and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`
          )
        );
      }
    });
  }
}

export function ensureRoutes(routes) {
  toArray(routes).forEach(route => ensureRoute(route));
}

export function fireRouterEvent(type, detail) {
  return !window.dispatchEvent(new CustomEvent(
    `vaadin-router-${type}`,
    {cancelable: type === 'go', detail}
  ));
}

export function isObject(o) {
  // guard against null passing the typeof check
  return typeof o === 'object' && !!o;
}

export function isFunction(f) {
  return typeof f === 'function';
}

export function isString(s) {
  return typeof s === 'string';
}

export function getNotFoundError(context) {
  const error = new Error(log(`Page not found (${context.pathname})`));
  error.context = context;
  error.code = 404;
  return error;
}

export const notFoundResult = new (class NotFoundResult {})();

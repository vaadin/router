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
}

export function ensureRoutes(routes) {
  toArray(routes).forEach(route => ensureRoute(route));
}

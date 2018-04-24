export function toArray(objectOrArray) {
  objectOrArray = objectOrArray || [];
  return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
}

export function ensureRoute(route) {
  if (!route || typeof route.path !== 'string') {
    const message = 'the `routes` parameter of Vaadin Router should be an object '
     + 'with a `path` string property or an array of such objects';
    console.error(message, route);
    throw new Error(message);
  }
}

export function ensureRoutes(routes) {
  toArray(routes).forEach(route => ensureRoute(route));
}

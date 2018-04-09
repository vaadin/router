export function toArray(objectOrArray) {
  return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
}

export function ensureRoute(route) {
  if (!route || typeof route.path !== 'string') {
    const message = 'the `routes` parameter <vaadin-router> should be an object with a `path` '
     + 'string property or an array of such objects';
    console.error(message, route);
    throw new Error(message);
  }
}

export function ensureRoutes(routes) {
  if (!routes) {
    const message = 'the `routes` parameter for <vaadin-router> cannot be null';
    console.error(message, routes);
    throw new Error(message);
  }
  
  toArray(routes).forEach(route => ensureRoute(route));
}

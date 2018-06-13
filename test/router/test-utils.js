function verifyActiveRoutes(router, expectedSegments) {
  expect(router.__previousContext.chain.map(route => route.path)).to.deep.equal(expectedSegments);
}

console.log('!1!!!!');

(window.VaadinTestNamespace || (window.VaadinTestNamespace = {})).verifyActiveRoutes = verifyActiveRoutes;

function verifyActiveRoutes(router, expectedSegments) {
  expect(router.__previousContext.chain.map(route => route.path)).to.deep.equal(expectedSegments);
}

(window.VaadinTestNamespace || (window.VaadinTestNamespace = {})).verifyActiveRoutes = verifyActiveRoutes;

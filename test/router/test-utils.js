function verifyActiveRoutes(router, expectedSegments) {
  expect(router.__previousContext.chain.map(route => route.path)).to.deep.equal(expectedSegments);
}

function onBeforeLeaveAction(componentName, callback) {
  return context => {
    const component = context.component(componentName);
    component.onBeforeLeave = callback;
    return component;
  };
}

function onBeforeEnterAction(componentName, callback) {
  return context => {
    const component = context.component(componentName);
    component.onBeforeEnter = callback;
    return component;
  };
}

function onAfterEnterAction(componentName, callback) {
  return context => {
    const component = context.component(componentName);
    component.onAfterEnter = callback;
    return component;
  };
}

const vaadinTestNamespace = (window.VaadinTestNamespace || (window.VaadinTestNamespace = {}));

vaadinTestNamespace.verifyActiveRoutes = verifyActiveRoutes;
vaadinTestNamespace.onBeforeLeaveAction = onBeforeLeaveAction;
vaadinTestNamespace.onBeforeEnterAction = onBeforeEnterAction;
vaadinTestNamespace.onAfterEnterAction = onAfterEnterAction;

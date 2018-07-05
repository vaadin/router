function verifyActiveRoutes(router, expectedSegments) {
  expect(router.__previousContext.chain.map(item => item.route.path)).to.deep.equal(expectedSegments);
}

function onBeforeLeaveAction(componentName, callback, name) {
  return (context, commands) => {
    const component = commands.component(componentName);
    component.name = name;
    component.onBeforeLeave = callback;
    return component;
  };
}

function onBeforeEnterAction(componentName, callback, name) {
  return (context, commands) => {
    const component = commands.component(componentName);
    component.name = name;
    component.onBeforeEnter = callback;
    return component;
  };
}

function onAfterEnterAction(componentName, callback, name) {
  return (context, commands) => {
    const component = commands.component(componentName);
    component.name = name;
    component.onAfterEnter = callback;
    return component;
  };
}

function onAfterLeaveAction(componentName, callback, name) {
  return (context, commands) => {
    const component = commands.component(componentName);
    component.name = name;
    component.onAfterLeave = callback;
    return component;
  };
}

function checkOutletContents(root, valueGetter, expectedValues) {
  let currentElementToCheck = root;
  for (let i = 0; i < expectedValues.length; i++) {
    const expectedValue = expectedValues[i];
    expect(currentElementToCheck, `Failed to find a child '${expectedValue}'`).to.be.not.null;
    expect(currentElementToCheck[valueGetter]).to.match(new RegExp(expectedValue, 'i'));
    expect(currentElementToCheck.children.length, `Expect each outlet element to have no more than 1 child`).to.be.below(2);
    currentElementToCheck = currentElementToCheck.children[0];
  }
  expect(currentElementToCheck,
    `Got '${expectedValues}' values to check but got at least one more child in outlet: '${(currentElementToCheck || {})[valueGetter]}'`)
    .to.be.an('undefined');
}

const vaadinTestNamespace = (window.VaadinTestNamespace || (window.VaadinTestNamespace = {}));

vaadinTestNamespace.verifyActiveRoutes = verifyActiveRoutes;
vaadinTestNamespace.onBeforeLeaveAction = onBeforeLeaveAction;
vaadinTestNamespace.onBeforeEnterAction = onBeforeEnterAction;
vaadinTestNamespace.onAfterEnterAction = onAfterEnterAction;
vaadinTestNamespace.onAfterLeaveAction = onAfterLeaveAction;
vaadinTestNamespace.checkOutletContents = checkOutletContents;

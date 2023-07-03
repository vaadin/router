import { expect } from '@esm-bundle/chai';
import type {
  AfterEnterObserver,
  AfterLeaveObserver,
  BeforeEnterObserver,
  BeforeLeaveObserver,
  Commands,
  Context,
  Router,
  ComponentResult,
  WebComponentInterface,
} from '../../src/router.js';

export function verifyActiveRoutes(router: Router, expectedSegments: readonly string[]) {
  // @ts-expect-error: private property use is intentional
  expect(router.__previousContext?.chain.map((item) => item.route.path)).to.deep.equal(expectedSegments);
}

type NamedElement = {
  name?: string;
};

function createAction<K extends keyof HTMLElementTagNameMap, I extends WebComponentInterface>(
  componentName: K,
  name: string | undefined,
  adjust: (element: ComponentResult<HTMLElementTagNameMap[K] & I>) => ComponentResult<HTMLElementTagNameMap[K] & I>,
) {
  return (context: Context, commands: Commands) => {
    const component = commands.component(componentName) as ComponentResult<HTMLElementTagNameMap[K] & NamedElement>;
    component.name = name;
    return adjust(component);
  };
}

export function onBeforeLeaveAction<K extends keyof HTMLElementTagNameMap>(
  componentName: K,
  callback: BeforeLeaveObserver['onBeforeLeave'],
  name?: string,
) {
  return createAction<K, BeforeLeaveObserver>(componentName, name, (component) => {
    component.onBeforeLeave = callback;
    return component;
  });
}

export function onBeforeEnterAction<K extends keyof HTMLElementTagNameMap>(
  componentName: K,
  callback: BeforeEnterObserver['onBeforeEnter'],
  name?: string,
) {
  return createAction<K, BeforeEnterObserver>(componentName, name, (component) => {
    component.onBeforeEnter = callback;
    return component;
  });
}

export function onAfterEnterAction<K extends keyof HTMLElementTagNameMap>(
  componentName: K,
  callback: AfterEnterObserver['onAfterEnter'],
  name?: string,
) {
  return createAction<K, AfterEnterObserver>(componentName, name, (component) => {
    component.onAfterEnter = callback;
    return component;
  });
}

export function onAfterLeaveAction<K extends keyof HTMLElementTagNameMap>(
  componentName: K,
  callback: AfterLeaveObserver['onAfterLeave'],
  name?: string,
) {
  return createAction<K, AfterLeaveObserver>(componentName, name, (component) => {
    component.onAfterLeave = callback;
    return component;
  });
}

export function checkOutletContents<T extends HTMLElement>(root: T, property: keyof T, expectedValues: readonly string[]) {
  let currentElementToCheck = root;
  for (let i = 0; i < expectedValues.length; i++) {
    const expectedValue = expectedValues[i];
    expect(currentElementToCheck, `Failed to find a child '${expectedValue}'`).to.be.ok;
    expect(currentElementToCheck[property]).to.match(new RegExp(expectedValue, 'i'));
    expect(
      currentElementToCheck.children.length,
      `Expect each outlet element to have no more than 1 child`,
    ).to.be.below(2);
    currentElementToCheck = currentElementToCheck.children[0] as T;
  }
  expect(
    currentElementToCheck,
    `Got '${expectedValues}' values to check but got at least one more child in outlet: '${
      (currentElementToCheck || {})[property]
    }'`,
  ).to.be.an('undefined');
}

export function cleanup(element: Element) {
  for (const child of element.children) {
    child.remove();
  }
}

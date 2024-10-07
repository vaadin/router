/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
/* eslint-enable chai-friendly/no-unused-expressions */

import { expect } from '@esm-bundle/chai';
import type { Commands, RouteContext, Router, WebComponentInterface, Route } from '../../src/index.js';
import type { AnyObject } from '../../src/resolver/types.js';

export async function waitForNavigation(): Promise<void> {
  return await new Promise((resolve) => {
    window.addEventListener('popstate', () => resolve(), { once: true });
  });
}

export function cleanup(element: Element): void {
  element.innerHTML = '';
}

export function verifyActiveRoutes(router: Router, expectedSegments: string[]): void {
  // @ts-expect-error: __previousContext is a private property
  expect(router.__previousContext?.chain?.map((item) => item.route.path)).to.deep.equal(expectedSegments);
}

function createWebComponentAction<T extends keyof WebComponentInterface>(method: T) {
  return <R extends AnyObject, C extends AnyObject>(
    componentName: string,
    callback: WebComponentInterface<R, C>[T],
    name: string = 'unknown',
  ) =>
    function lifecycleCallback(
      this: Route<R, C>,
      _context: RouteContext<R, C>,
      commands: Commands,
    ): WebComponentInterface<R, C> {
      const component = commands.component(componentName) as WebComponentInterface;
      component.name = name;
      component[method] = callback;
      return component;
    };
}

export const onBeforeLeaveAction = createWebComponentAction('onBeforeLeave');
export const onBeforeEnterAction = createWebComponentAction('onBeforeEnter');
export const onAfterEnterAction = createWebComponentAction('onAfterEnter');
export const onAfterLeaveAction = createWebComponentAction('onAfterLeave');

export function checkOutletContents<T extends Element>(
  root: T | undefined,
  valueGetter: keyof T,
  expectedValues: readonly string[],
): void {
  let currentElementToCheck = root;
  for (const expectedValue of expectedValues) {
    expect(currentElementToCheck, `Failed to find a child '${expectedValue}'`).to.exist;
    expect(currentElementToCheck![valueGetter]).to.match(new RegExp(expectedValue, 'ui'));
    expect(
      currentElementToCheck!.children.length,
      `Expect each outlet element to have no more than 1 child`,
    ).to.be.below(2);
    currentElementToCheck = currentElementToCheck!.children[0] as T | undefined;
  }
  expect(
    currentElementToCheck,
    `Got '${String(expectedValues)}' values to check but got at least one more child in outlet: '${String(
      currentElementToCheck ? currentElementToCheck[valueGetter] : undefined,
    )}'`,
  ).to.be.an('undefined');
}

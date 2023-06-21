import { expect } from '@esm-bundle/chai';
import type { Router } from '../../src/router.js';

export function verifyActiveRoutes(router: Router, expectedSegments: readonly string[]): void {
  // @ts-expect-error: private field access
  expect(router.__previousContext.chain.map((item) => item.route.path)).to.deep.equal(expectedSegments);
}

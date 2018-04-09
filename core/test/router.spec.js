const expect = require('chai').expect;
const Router = require('../dist/vaadin-router-core');

describe('Vaadin.Router', () => {
  it('should have a no-arg constructor', () => {
    const router = new Router();
    expect(router).to.not.be.null;
  });
});
import sinon from 'sinon';

const BASE_URL = `${location.origin}/`;
const DEFAULT_URL = location.href;

const toBaseUrl = () => {
  if (location.href !== BASE_URL) {
    history.pushState(null, '', BASE_URL);
  }
};
const toDefaultUrl = () => {
  if (location.href !== DEFAULT_URL) {
    history.pushState(null, '', DEFAULT_URL);
  }
};

before(toBaseUrl);
after(toDefaultUrl);
beforeEach(toBaseUrl);
afterEach(() => {
  sinon.restore();
});

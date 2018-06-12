const willAnimate = elem => {
  const name = getComputedStyle(elem).getPropertyValue('animation-name');
  return name && name != 'none';
};

const waitForAnimation = (elem, cb) => {
  const listener = () => {
    elem.removeEventListener('animationend', listener);
    cb();
  };
  elem.addEventListener('animationend', listener);
};

const toggle = (elem, attr, state) => {
  if (state) {
    elem.setAttribute(attr, '');
  } else {
    elem.removeAttribute(attr);
  }
};

function animate(elem, options = {}) {
  const attr = options.attribute || 'animating';
  toggle(elem, attr, true);

  return new Promise(resolve => {
    if (willAnimate(elem)) {
      waitForAnimation(elem, () => {
        toggle(elem, attr);
        resolve();
      });
    } else {
      toggle(elem, attr);
      resolve();
    }
  });
}

export default animate;

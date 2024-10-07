const willAnimate = (elem: Element) => {
  const name = getComputedStyle(elem).getPropertyValue('animation-name');
  return name && name !== 'none';
};

const waitForAnimation = (elem: Element, cb: () => void) => {
  const listener = () => {
    elem.removeEventListener('animationend', listener);
    cb();
  };
  elem.addEventListener('animationend', listener);
};

async function animate(elem: Element, className: string): Promise<void> {
  elem.classList.add(className);

  return await new Promise((resolve: () => void) => {
    if (willAnimate(elem)) {
      const rect = elem.getBoundingClientRect();
      const size = `height: ${rect.bottom - rect.top}px; width: ${rect.right - rect.left}px`;
      elem.setAttribute('style', `position: absolute; ${size}`);
      waitForAnimation(elem, () => {
        elem.classList.remove(className);
        elem.removeAttribute('style');
        resolve();
      });
    } else {
      elem.classList.remove(className);
      resolve();
    }
  });
}

export default animate;

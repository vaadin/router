export default async function animate(element: Element, className: string): Promise<void> {
  element.classList.add(className);
  const animation = getComputedStyle(element).getPropertyValue('animation-name');

  if (animation && animation !== 'none') {
    const rect = element.getBoundingClientRect();
    const size = `height: ${rect.bottom - rect.top}px; width: ${rect.right - rect.left}px`;
    element.setAttribute('style', `position: absolute; ${size}`);

    await new Promise<void>((resolve) => {
      element.addEventListener('animationend', () => resolve(), { once: true });
    });

    element.classList.remove(className);
    element.removeAttribute('style');
  } else {
    element.classList.remove(className);
  }
}

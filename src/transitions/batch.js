import animate from './animate';

const run = (node, keyFrames, duration = '0s', func = 'ease') => {
  const key = Math.floor(Math.random() * 100);
  const name = `kfr${key}`;
  const attribute = `animate-${key}`;

  const style = document.createElement('style');

  const rules = keyFrames.map(kfr =>
    Object.keys(kfr).map(key =>
      key + '{' + Object.keys(kfr[key]).map(prop =>
        prop + ':' + kfr[key][prop]
      ).join(';') + '}')
  ).join('');

  style.textContent = `@keyframes ${name} { ${rules}`;

  document.body.appendChild(style);

  const rect = node.getBoundingClientRect();

  let css = `animation: ${duration} ${func} ${name};`;
  css += `height: ${rect.bottom - rect.top}px; width: ${rect.right - rect.left}px`;
  node.setAttribute('style', `position: absolute; ${css}`);

  return new Promise(resolve => {
    animate(node, {
      attribute
    }).then(() => {
      document.body.removeChild(style);
      node.removeAttribute('style');
      resolve();
    });
  });
};

function batch(targets) {
  return Promise.all(targets.map(target => run(
    target.elem,
    target.keyFrames,
    target.duration,
    target.func
  )));
}

export default batch;

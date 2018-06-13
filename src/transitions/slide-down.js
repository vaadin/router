import batch from './batch';

function slideDown(oldElem, newElem, duration = '0.1s', func = 'ease-in-out') {
  const slideOut = [{
    from: {
      transform: 'translate3d(0, 0, 0)'
    }
  }, {
    to: {
      transform: 'translate3d(0, 100%, 0)',
      visibility: 'hidden'
    }
  }];
  const slideIn = [{
    from: {
      transform: 'translate3d(0, -100%, 0)',
      visibility: 'visible'
    }
  }, {
    to: {
      transform: 'translate3d(0, 0, 0)'
    }
  }];
  return batch([
    {elem: oldElem, keyFrames: slideOut, duration, func},
    {elem: newElem, keyFrames: slideIn, duration, func}
  ]);
}

export default slideDown;

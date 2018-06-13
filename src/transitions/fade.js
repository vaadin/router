import batch from './batch';

function fade(oldElem, newElem, duration = '0.1s', func = 'ease-in-out') {
  const fadeIn = [{
    from: {
      opacity: 0
    }
  }, {
    to: {
      opacity: 1
    }
  }];
  const fadeOut = [{
    from: {
      opacity: 1
    }
  }, {
    to: {
      opacity: 0
    }
  }];
  return batch([
    {elem: oldElem, keyFrames: fadeOut, duration, func},
    {elem: newElem, keyFrames: fadeIn, duration, func}
  ]);
}

export default fade;

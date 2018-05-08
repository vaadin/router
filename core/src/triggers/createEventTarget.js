export function createEventTarget() {
  const listeners = [];
  return {
    addListener: (listener) => {
      listeners.push(listener);
    },

    removeListener: (listener) => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    },

    dispatchEvent: (event) => {
      for (let i = 0; i < listeners.length; i += 1) {
        listeners[i]();
      }
    }
  };
}

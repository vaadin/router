(() => {
  window.__tempModuleStorage = window.__tempModuleStorage || [];

  window.__importModule = url => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;

      script.onload = () => {
        document.body.removeChild(script);
        resolve(window.__tempModuleStorage.pop());
      };

      script.onerror = () => {
        document.body.removeChild(script);
        reject(new Error('Failed to load module script with URL ' + url));
      };

      document.body.appendChild(script);
    });
  };
})();

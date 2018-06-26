(() => {
  const userRoutes = [
    {path: '/', component: 'x-user-home'},
    {path: '/:user', component: 'x-user-profile'},
  ];

  window.__tempModuleStorage = window.__tempModuleStorage || [];

  window.__tempModuleStorage.push({
    default: userRoutes
  });
})();

(() => {
  window.Vaadin = window.Vaadin || {};
  Vaadin.Demo = Vaadin.Demo || {};
  Vaadin.Demo.moduleStorage = Vaadin.Demo.moduleStorage || [];

  const userRoutes = [
    {path: '/', component: 'x-user-home'},
    {path: '/:user', component: 'x-user-profile'},
  ];

  Vaadin.Demo.moduleStorage.push({
    default: userRoutes
  });
})();

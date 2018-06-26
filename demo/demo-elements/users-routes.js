(() => {
  window.Vaadin = window.Vaadin || {};
  Vaadin.Demo = Vaadin.Demo || {};
  Vaadin.Demo.moduleStorage = Vaadin.Demo.moduleStorage || [];

  const usersRoutes = [
    {path: '/', component: 'x-user-home'},
    {path: '/:user', component: 'x-user-profile'},
  ];

  Vaadin.Demo.moduleStorage.push({
    default: usersRoutes
  });
})();

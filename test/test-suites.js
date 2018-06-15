window.VaadinRouterSuites = {
  default: [
    'resolver/resolver.spec.js',
    'router/router.spec.html',
    'router/dynamic.redirect.spec.html',
    'router/lifecycle-events.spec.html',
  ],
  coverage: [
    'resolver/matchPath.spec.js',
    'resolver/matchRoute.spec.js',
    'resolver/resolver.spec.js',
    // 'resolver/generateUrls.spec.js',
    'triggers/triggerNavigation.spec.js',
    'triggers/setNavigationTriggers.spec.js',
    'triggers/popstate.spec.js',
    'triggers/click.spec.html',
    'transitions/animate.spec.html',
  ],
};

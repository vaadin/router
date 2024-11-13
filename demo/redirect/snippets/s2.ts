import { Router } from '@vaadin/router';

// tag::snippet[]
Router.go({
  pathname: '/to/path',
  // optional
  search: '?paramName=value',
  // optional
  hash: '#sectionName',
});
// end::snippet[]

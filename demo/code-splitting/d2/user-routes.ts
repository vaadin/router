import '@helpers/x-user-list.js';
import '@helpers/x-user-profile.js';
import type { Route } from '@vaadin/router';

// tag::snippet[]
const usersRoutes: readonly Route[] = [
  { path: '/', component: 'x-user-list' },
  { path: '/:user', component: 'x-user-profile' },
];
// end::snippet[]

export default usersRoutes;

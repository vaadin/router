import type { Route } from '../../src/index.js';

const usersRoutes: readonly Route[] = [
  { path: '/', component: 'x-user-home' },
  { path: '/:user', component: 'x-user-profile' },
];

export default usersRoutes;

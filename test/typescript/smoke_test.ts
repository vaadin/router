import {Router} from '../../dist/vaadin-router';

const router = new Router(document.body, {
  baseUrl: '/'
});
router.setRoutes([
  {path: 'foo', component: 'x-foo'},
  {path: 'bar', redirect: '/foo'},
  {path: 'qux', name: 'with-children', children: [
    {path: 'quz', action: () => document.createElement('x-quz')},
    {path: 'quz-promise', action: () => {
      return Promise.resolve(document.createElement('x-quz'));
    }}
  ]}
]);

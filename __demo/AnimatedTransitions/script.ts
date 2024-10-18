import { Router } from '../../src/index.js';

const router = new Router(document.getElementById('outlet'));
router.setRoutes([
  {
    path: '/',
    animate: true,
    children: [
      { path: '', component: 'x-home-view' },
      { path: '/image-:size(\\d+)px', component: 'x-image-view' },
      { path: '/users', component: 'x-user-list' },
      { path: '/users/:user', component: 'x-user-profile' },
    ],
  },
]);

/* === IFrame-specific code === */

export type InputData = Readonly<{
  type: 'init';
}>;

export type OutputData = Readonly<{
  url: string | null;
}>;

let controllers: AbortController[] = [];

addEventListener('message', ({ data: { type }, origin, source }: MessageEvent<InputData>) => {
  if (type === 'init') {
    controllers.forEach((controller) => controller.abort());
    controllers = Array.from(document.querySelectorAll('a'), (element) => {
      const controller = new AbortController();

      element.addEventListener(
        'click',
        ({ target }) => {
          source?.postMessage({ url: (target as HTMLAnchorElement | null)?.href }, { targetOrigin: origin });
        },
        { signal: controller.signal },
      );

      return controller;
    });
  }
});

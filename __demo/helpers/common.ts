import { applyTheme } from './theme';

applyTheme(document);

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('theme', 'dark');
}

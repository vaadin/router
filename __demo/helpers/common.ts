import { applyTheme } from './theme';

import '@vaadin/vaadin-lumo-styles/badge-global.js';
import '@vaadin/vaadin-lumo-styles/color-global.js';
import '@vaadin/vaadin-lumo-styles/typography-global.js';

applyTheme(document);

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('theme', 'dark');
}

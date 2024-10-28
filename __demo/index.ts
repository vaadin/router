import '@vaadin/vaadin-lumo-styles/global.js';
import './vaadin-demo-layout.js';
import './vaadin-presentation.js';
import './stories/animated-transitions/index.js';

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('theme', 'dark');
}

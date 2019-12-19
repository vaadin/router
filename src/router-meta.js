import {usageStatistics} from '@vaadin/vaadin-usage-statistics/vaadin-usage-statistics.js';

window.Vaadin = window.Vaadin || {};
window.Vaadin.registrations = window.Vaadin.registrations || [];

window.Vaadin.registrations.push({
  is: '@vaadin/router',
  version: '1.6.0',
});

usageStatistics();

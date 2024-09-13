// @ts-ignore
import { usageStatistics } from '@vaadin/vaadin-usage-statistics/vaadin-usage-statistics.js';

// @ts-ignore
window.Vaadin ??= {};
// @ts-ignore
window.Vaadin.registrations ??= [];
// @ts-ignore
window.Vaadin.registrations.push({
  is: '@vaadin/router',
  version: '1.7.2',
});

usageStatistics();

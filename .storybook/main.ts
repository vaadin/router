import type { StorybookConfig } from '@storybook/web-components-vite';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

const config: StorybookConfig = {
  stories: ['../__demo/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@chromatic-com/storybook'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite');

    const cfg = mergeConfig(config, {
      assetsInclude: ['**/*.html'],
    });

    console.log(cfg);

    return cfg;
  },
};
export default config;

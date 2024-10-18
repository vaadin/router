import { fn } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import url from './frame.html?url';
import type { OutputData } from './script.js';

type AnimatedTransitionsProps = Readonly<{
  onClick(url: string | null): void;
}>;

const meta = {
  title: 'AnimatedTransitions',
  tags: ['autodocs'],
  render({ onClick }) {
    return html`<iframe sandbox="allow-scripts" src=${url}></iframe>`;
  },
  args: { onClick: fn() },
} satisfies Meta<AnimatedTransitionsProps>;

export default meta;

type Story = StoryObj<{}>;

export const Primary: Story = {
  args: {
    primary: true,
  },
};

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './icon-button';
import {
  IconColor,
} from '../../../helpers/constants/design-system';
import Tooltip from '../tooltip/tooltip';
import { Icon, IconName } from '../../component-library';

const meta: Meta<typeof IconButton> = {
  title: 'Components/UI/IconButton',
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component: 'IconButton component that supports both string and React element labels',
      },
    },
  },
  argTypes: {
    onClick: { action: 'clicked' },
    disabled: {
      control: 'boolean',
    },
    round: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    Icon: <Icon name={IconName.Add} color={IconColor.iconDefault} />,
    label: 'Default Button',
    onClick: () => console.log('Button clicked'),
  },
};

export const Disabled: Story = {
  args: {
    Icon: <Icon name={IconName.Add} color={IconColor.iconDefault} />,
    label: 'Disabled Button',
    disabled: true,
    onClick: () => console.log('Button clicked'),
  },
};

export const LongLabel: Story = {
  args: {
    Icon: <Icon name={IconName.Add} color={IconColor.iconDefault} />,
    label: 'This is a very long button label that should trigger tooltip',
    onClick: () => console.log('Button clicked'),
  },
};

export const RoundButton: Story = {
  args: {
    Icon: <Icon name={IconName.Add} color={IconColor.iconDefault} />,
    label: 'Round Button',
    round: true,
    onClick: () => console.log('Button clicked'),
  },
};

export const WithReactElementLabel: Story = {
  args: {
    Icon: <Icon name={IconName.Add} color={IconColor.iconDefault} />,
    label: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>Custom</span>
        <span style={{ fontSize: '10px', color: '#666' }}>Element Label</span>
      </div>
    ),
    onClick: () => console.log('Button clicked'),
  },
};

export const RoundButtonWithReactElementLabel: Story = {
  args: {
    Icon: <Icon name={IconName.Add} color={IconColor.iconDefault} />,
    label: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>Round</span>
        <span style={{ fontSize: '10px', color: '#666' }}>Element</span>
      </div>
    ),
    round: true,
    onClick: () => console.log('Button clicked'),
  },
};

// Test case: Emulate "Bridge button disabled when chain is unsupported"
export const UnsupportedNetwork: Story = {
  args: {
    label: 'Bridge',
    disabled: true,
    Icon: <Icon name={IconName.Bridge} color={IconColor.iconDefault} />,
    tooltipRender: (content) => {
      // This matches exactly what the test expects
      const buttonWithAttr = React.cloneElement(content);

      return (
        <Tooltip title="Unavailable on this network" position="bottom">
          {buttonWithAttr}
        </Tooltip>
      );
    },
  },
};

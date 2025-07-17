# IconButton Component

A flexible icon button component that supports both string and React element labels.

## Features

- Supports both string and React element labels
- Round and rectangular button styles
- Tooltip support for long text labels
- Disabled state support
- Customizable styling

## Usage

### Basic Usage with String Label

```tsx
import IconButton from './icon-button';
import { Icon, IconName } from '../../component-library';
import { IconColor } from '../../../helpers/constants/design-system';

<IconButton
  Icon={<Icon name={IconName.Add} color={IconColor.iconDefault} />}
  label="Add Item"
  onClick={() => console.log('Button clicked')}
/>
```

### Usage with React Element Label

```tsx
<IconButton
  Icon={<Icon name={IconName.Send} color={IconColor.iconDefault} />}
  label={
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold' }}>Send</span>
      <span style={{ fontSize: '10px', color: '#666' }}>Transaction</span>
    </div>
  }
  onClick={() => console.log('Button clicked')}
/>
```

### Round Button Style

```tsx
<IconButton
  Icon={<Icon name={IconName.Add} color={IconColor.iconDefault} />}
  label="Round Button"
  round={true}
  onClick={() => console.log('Button clicked')}
/>
```

### Disabled State

```tsx
<IconButton
  Icon={<Icon name={IconName.Add} color={IconColor.iconDefault} />}
  label="Disabled Button"
  disabled={true}
  onClick={() => console.log('Button clicked')}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `Icon` | `React.ReactNode` | - | The icon to display |
| `label` | `React.ReactNode` | - | The label text or React element |
| `onClick` | `() => void` | - | Click handler function |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `round` | `boolean` | `true` | Whether to use round button style |
| `className` | `string` | `''` | Additional CSS class name |
| `tooltipRender` | `(content: React.ReactElement) => React.ReactElement` | - | Custom tooltip renderer |

## Label Types

### String Labels
String labels are automatically handled with text truncation and tooltip support for long text.

### React Element Labels
React element labels are rendered directly without any text processing, allowing for complex layouts and custom styling.

## Examples

### Complex Label with Multiple Elements

```tsx
<IconButton
  Icon={<Icon name={IconName.Wallet} color={IconColor.iconDefault} />}
  label={
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Wallet</div>
      <div style={{ fontSize: '10px', color: '#666' }}>Balance: $1,234</div>
    </div>
  }
  onClick={() => console.log('Wallet button clicked')}
/>
```

### Label with Icons

```tsx
<IconButton
  Icon={<Icon name={IconName.Notification} color={IconColor.iconDefault} />}
  label={
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Icon name={IconName.Notification} size={12} />
      <span>Notifications</span>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'red'
      }} />
    </div>
  }
  onClick={() => console.log('Notifications clicked')}
/>
```

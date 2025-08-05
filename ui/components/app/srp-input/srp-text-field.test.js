import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import SrpTextField from './srp-text-field';
import { Text } from '../../component-library';
import { ButtonIcon } from '../../component-library';
import { IconName } from '../../component-library/icon';

// Mock ButtonIcon component
jest.mock('../../component-library', () => ({
  ...jest.requireActual('../../component-library'),
  ButtonIcon: ({ iconName, onClick, 'data-testid': dataTestId, ariaLabel }) => (
    <button
      data-testid={dataTestId}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ color: iconName === IconName.Eye ? 'green' : 'red' }}
    >
      {iconName === IconName.Eye ? 'Eye Open' : 'Eye Closed'}
    </button>
  ),
}));

describe('SrpTextField', () => {
  it('should render with basic props', () => {
    const { getByTestId } = renderWithProvider(
      <SrpTextField data-testid="test-input" value="test value" />,
    );

    const input = getByTestId('test-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('test value');
  });

  it('should handle onChange event', () => {
    const handleChange = jest.fn();
    const { getByTestId } = renderWithProvider(
      <SrpTextField data-testid="test-input" onChange={handleChange} />,
    );

    const input = getByTestId('test-input');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle onFocus and onBlur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    const { getByTestId } = renderWithProvider(
      <SrpTextField
        data-testid="test-input"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />,
    );

    const input = getByTestId('test-input');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should render with startAccessory', () => {
    const { container } = renderWithProvider(
      <SrpTextField
        data-testid="test-input"
        startAccessory={<Text data-testid="accessory">1</Text>}
      />,
    );

    const accessory = container.querySelector('[data-testid="accessory"]');
    expect(accessory).toBeInTheDocument();
  });

  it('should render with endAccessory', () => {
    const { container } = renderWithProvider(
      <SrpTextField
        data-testid="test-input"
        endAccessory={<div data-testid="end-accessory">Eye</div>}
      />,
    );

    const accessory = container.querySelector('[data-testid="end-accessory"]');
    expect(accessory).toBeInTheDocument();
  });

  it('should handle input ref', () => {
    const ref = React.createRef();
    const { getByTestId } = renderWithProvider(
      <SrpTextField data-testid="test-input" ref={ref} />,
    );

    const input = getByTestId('test-input');
    expect(ref.current).toBe(input);
  });

  it('should show focused state', () => {
    const { container, getByTestId } = renderWithProvider(
      <SrpTextField data-testid="test-input" />,
    );

    const input = getByTestId('test-input');
    const textField = container.querySelector('.srp-text-field');

    fireEvent.focus(input);
    expect(textField).toHaveStyle({
      borderColor: 'var(--color-primary-default)',
    });
  });

  it('should render ButtonIcon with correct eye icon state', () => {
    const mockOnClick = jest.fn();
    const { getByTestId } = renderWithProvider(
      <SrpTextField
        data-testid="test-input"
        endAccessory={
          <ButtonIcon
            data-testid="toggle"
            iconName={IconName.EyeSlash}
            onClick={mockOnClick}
            ariaLabel="Hide"
          />
        }
      />,
    );

    const toggle = getByTestId('toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent('Eye Closed');
    expect(toggle).toHaveAttribute('aria-label', 'Hide');
  });
});

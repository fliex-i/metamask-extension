import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Text } from '../../component-library';
import {
  Display,
  AlignItems,
  BorderRadius,
  BackgroundColor,
  BorderColor,
  BorderStyle,
  TextColor,
} from '../../../helpers/constants/design-system';

const SrpTextField = React.forwardRef(
  (
    {
      id,
      'data-testid': dataTestId,
      type = 'password',
      onChange,
      onFocus,
      onBlur,
      onPaste,
      value,
      autoComplete,
      startAccessory,
      endAccessory,
      className = '',
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    const handleFocus = (event) => {
      setFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event) => {
      setFocused(false);
      onBlur?.(event);
    };

    return (
      <div
        className={`srp-text-field ${className}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-background-default)',
          border: `1px solid ${
            focused
              ? 'var(--color-primary-default)'
              : 'var(--color-border-default)'
          }`,
          borderRadius: '8px',
          padding: '8px 12px',
          minHeight: '40px',
          transition: 'all 0.2s ease-in-out',
          boxShadow: focused ? '0 0 0 2px var(--color-primary-muted)' : 'none',
        }}
      >
        {startAccessory && (
          <div
            style={{
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {startAccessory}
          </div>
        )}

        <input
          ref={inputRef}
          id={id}
          data-testid={dataTestId}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={onPaste}
          autoComplete={autoComplete}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.4',
            color: 'var(--color-text-default)',
            width: '100%',
          }}
          {...props}
        />

        {endAccessory && (
          <div
            style={{
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {endAccessory}
          </div>
        )}
      </div>
    );
  },
);

SrpTextField.displayName = 'SrpTextField';

SrpTextField.propTypes = {
  id: PropTypes.string,
  'data-testid': PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onPaste: PropTypes.func,
  value: PropTypes.string,
  autoComplete: PropTypes.string,
  startAccessory: PropTypes.node,
  endAccessory: PropTypes.node,
  className: PropTypes.string,
};

export default SrpTextField;

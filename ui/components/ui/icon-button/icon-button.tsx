import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { Text, ButtonBase } from '../../component-library';
import type { ButtonBaseProps } from '../../component-library/button-base/button-base.types';
import {
  AlignItems,
  BackgroundColor,
  Display,
  FlexDirection,
  JustifyContent,
  TextVariant,
} from '../../../helpers/constants/design-system';
import Tooltip from '../tooltip/tooltip';
import IconButtonRound from './icon-button-round';

export type IconButtonProps = ButtonBaseProps<'button'> & {
  onClick: () => void;
  Icon: React.ReactNode;
  label: React.ReactNode;
  className?: string;
  tooltipRender?: (content: React.ReactElement) => React.ReactElement;
  round?: boolean;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      onClick,
      Icon,
      disabled = false,
      label,
      className = '',
      tooltipRender,
      round = true,
      ...props
    },
    ref,
  ) => {
    // If label is JSX element, always use round button to avoid Text component wrapping
    const isJSXLabel = typeof label !== 'string';
    const shouldUseRound = round || isJSXLabel;

    if (shouldUseRound) {
      // For round buttons, we need to handle both string and React element labels
      const labelString = typeof label === 'string' ? label : '';
      const labelElement = typeof label === 'string' ? undefined : label;
      console.log('labelElement', labelElement, labelString);
      console.log('label type:', typeof label);
      console.log('labelElement type:', typeof labelElement);
      console.log('isJSXLabel:', isJSXLabel);
      console.log('shouldUseRound:', shouldUseRound);
      console.log('label content:', label);
      if (labelElement) {
        console.log('labelElement is truthy, will render JSX');
        console.log('labelElement content:', labelElement);
      }
      return (
        <IconButtonRound
          onClick={onClick}
          Icon={Icon as object}
          disabled={disabled}
          label={labelString}
          labelElement={labelElement}
          tooltipRender={tooltipRender}
          ref={ref}
          {...props}
        />
      );
    }

    const buttonContent = (
      <ButtonBase
        className={classNames('icon-button', className)}
        onClick={onClick}
        backgroundColor={BackgroundColor.backgroundMuted}
        disabled={disabled}
        ref={ref}
        display={Display.InlineFlex}
        flexDirection={FlexDirection.Column}
        alignItems={AlignItems.center}
        justifyContent={JustifyContent.center}
        paddingTop={3}
        paddingBottom={3}
        paddingLeft={2}
        paddingRight={2}
        textProps={{
          ellipsis: false,
          className: 'icon-button__label',
        }}
        {...props}
      >
        {Icon}
        {typeof label === 'string' ? (
          label.length > 10 ? (
            <Tooltip title={label} position="bottom">
              <Text
                as="span"
                display={Display.Block}
                variant={TextVariant.bodySmMedium}
                ellipsis
              >
                {label}
              </Text>
            </Tooltip>
          ) : (
            <Text
              as="span"
              display={Display.Block}
              variant={TextVariant.bodySmMedium}
              ellipsis
              style={{ marginTop: '-4px' }}
            >
              {label}
            </Text>
          )
        ) : (
          <div
            style={{
              marginTop: '-4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '2px',
            }}
          >
            {label}
          </div>
        )}
      </ButtonBase>
    );

    return tooltipRender ? tooltipRender(buttonContent) : buttonContent;
  },
);

IconButton.displayName = 'IconButton';

export default IconButton;

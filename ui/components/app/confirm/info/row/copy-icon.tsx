import React, { CSSProperties, useCallback } from 'react';

import { useCopyToClipboard } from '../../../../../hooks/useCopyToClipboard';
import {
  BorderColor,
  IconColor,
} from '../../../../../helpers/constants/design-system';
import {
  AvatarAccount,
  AvatarAccountSize,
  ButtonIcon,
  ButtonIconSize,
  IconName,
} from '../../../../component-library';
import { Toast, ToastContainer } from '../../../../multichain/toast';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { MILLISECOND } from '../../../../../../shared/constants/time';
import classnames from '../../../../../../types/classnames';

type CopyCallback = (text: string) => void;

export const CopyIcon: React.FC<{
  copyText: string;
  color?: IconColor;
  style?: CSSProperties;
}> = ({ copyText, color, style = {} }) => {
  const [copied, handleCopy] = useCopyToClipboard();
  const t = useI18nContext();
  const [showCopyToast, setShowCopyToast] = React.useState(false);

  const handleClick = useCallback(async () => {
    (handleCopy as CopyCallback)(copyText);
    setShowCopyToast(true);
  }, [copyText]);

  return (
    <>
      <ButtonIcon
        color={color ?? IconColor.iconAlternative}
        iconName={copied ? IconName.CopySuccess : IconName.Copy}
        size={ButtonIconSize.Sm}
        style={{
          cursor: 'pointer',
          position: 'absolute',
          right: 0,
          top: 2,
          ...style,
        }}
        // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31879
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleClick}
        ariaLabel="copy-button"
      />
      {showCopyToast && (
        <ToastContainer>
          <Toast
            className="toast-copy"
            text={t('copiedExclamation')}
            onClose={() => setShowCopyToast(false)}
            startAdornment={undefined}
            onActionClick={() => {
              // Use setTimeout to prevent React re-render from
              // hiding the tooltip
              setTimeout(() => {
                setShowCopyToast(false);
              }, 250 * MILLISECOND);
            }}
          />
        </ToastContainer>
      )}
    </>
  );
};
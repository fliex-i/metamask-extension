import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
} from '../../component-library';
import QrCodeView from '../../ui/qr-code-view';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  getInternalAccountByAddress,
  getSelectedAccount,
} from '../../../selectors';
import {
  AlignItems,
  Display,
  FlexDirection,
} from '../../../helpers/constants/design-system';
import { endTrace, TraceName } from '../../../../shared/lib/trace';

export const ReceiveModal = ({ address, token, onClose, onBack }) => {
  const t = useI18nContext();
  const currentAccount = useSelector(getSelectedAccount);
  const internalAccount = useSelector((state) =>
    getInternalAccountByAddress(state, address),
  );
  const accountName = internalAccount?.metadata?.name || 'Account';
  const data = useMemo(
    () => ({ data: currentAccount.address }),
    [currentAccount],
  );

  useEffect(() => {
    endTrace({ name: TraceName.ReceiveModal });
  }, []);

  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader marginBottom={4} onClose={onClose} onBack={onBack}>
          {t('receive')}
        </ModalHeader>
        <Box
          display={Display.Flex}
          alignItems={AlignItems.center}
          flexDirection={FlexDirection.Column}
          paddingInlineEnd={4}
          paddingInlineStart={4}
          gap={2}
          style={{ overflowY: 'auto' }}
        >
          <div style={{ textAlign: 'center', fontSize: '20px' }}>
            USDT (ERC-20)
          </div>
          <div
            className="attention"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '13px',
              boxSizing: 'border-box',
            }}
          >
            <div className="attention-ico">
              <img src="../../images/icons/attention.svg" />
            </div>
            <div className="attention-des">
              <ul>
                <li>{t('receiveModalDes11')}</li>
                <br />
                <li>
                  <span>{t('receiveModalDes22')}</span>
                </li>
                <br />
                <li>{t('receiveModalDes33')}</li>
                <br />
                <li>{t('receiveModalDes44')}</li>
              </ul>
            </div>
          </div>
          <div className="attention-tips">{t('receiveModalTips')}</div>
          <QrCodeView Qr={data} />
        </Box>
      </ModalContent>
    </Modal>
  );
};

ReceiveModal.propTypes = {
  address: PropTypes.string.isRequired,
  token: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

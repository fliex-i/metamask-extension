import React from 'react';
import {
  Box,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  Text,
} from '../../../components/component-library';
import {
  AlignItems,
  Display,
  FlexDirection,
  FontWeight,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';

interface BankAccountRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: () => void;
}

const BankAccountRequiredModal: React.FC<BankAccountRequiredModalProps> = ({
  isOpen,
  onClose,
  onLink,
}) => {
  const t = useI18nContext();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('bankTopic')}</ModalHeader>
        <ModalBody>
          <Box
            display={Display.Flex}
            flexDirection={FlexDirection.Column}
            alignItems={AlignItems.center}
          >
            <img
              src={'/images/home/card.png'}
              alt="CryptoBridge Card"
              style={{ width: 180, margin: '24px 0 16px 0' }}
            />
            <Text
              variant={TextVariant.headingSm}
              fontWeight={FontWeight.Bold}
              textAlign={TextAlign.Center}
              style={{ marginBottom: 8, color: '#121312' }}
            >
              {t('bankDes')}
            </Text>
            <Text
              textAlign={TextAlign.Center}
              color={TextColor.textAlternative}
              style={{ color: '#121312' }}
            >
              {t('bankTips')}
            </Text>
          </Box>
        </ModalBody>
        <ModalFooter flexDirection={FlexDirection.Column} gap={2}>
          <div
            style={{
              fontSize: '16px',
              color: '#B771E5',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            {t('userManual1')}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '4px',
                border: '1px solid #B771E5',
                padding: '4px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
              onClick={() => {
                const link = document.createElement('a');
                link.href =
                  'https://www.crypto-bridge.co/wp-content/uploads/2025/06/FAQ-JP-01.pdf';
                link.download = 'FAQ-JP-01.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <img src="/images/home/user.svg" alt="" width={12} height={12} />{' '}
              {t('userManual')}
            </span>
            {t('userManual2')}
          </div>
          <div
            onClick={onLink}
            style={{
              height: '40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-primary-default)',
              cursor: 'pointer',
              borderRadius: '12px',
              color: 'white',
              marginTop: '16px',
            }}
          >
            {t('bankBtn2')}
          </div>
          <div
            onClick={onLink}
            style={{
              height: '40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#EDEDED',
              cursor: 'pointer',
              borderRadius: '12px',
              color: '#171717',
              marginTop: '16px',
            }}
          >
            {t('bankBtn1')}
          </div>
          <div
            onClick={onClose}
            style={{
              height: '40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              cursor: 'pointer',
              borderRadius: '12px',
              color: '#6F6F6F',
              marginTop: '16px',
              border: '1px solid #E2E2E2',
            }}
          >
            {t('bankBtn3')}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BankAccountRequiredModal;

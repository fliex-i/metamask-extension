import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Text,
  Modal,
  ModalOverlay,
  Button,
  ButtonVariant,
} from '../../components/component-library';
import ToggleButton from '../../components/ui/toggle-button';
import { ModalContent } from '../../components/component-library/modal-content/deprecated';
import { ModalHeader } from '../../components/component-library/modal-header';
import {
  Display,
  FlexDirection,
  TextVariant,
  TextColor,
  JustifyContent,
  AlignItems,
} from '../../helpers/constants/design-system';
import { useI18nContext } from '../../hooks/useI18nContext';
import {
  setAutoLockTimeLimit,
  setSystemIdleLockEnabled,
} from '../../store/actions';
import { getPreferences } from '../../selectors/selectors';
import { DEFAULT_AUTO_LOCK_TIME_LIMIT } from '../../../shared/constants/preferences';

interface AutoLockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutoLockModal: React.FC<AutoLockModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const t = useI18nContext();

  const {
    autoLockTimeLimit = DEFAULT_AUTO_LOCK_TIME_LIMIT,
    systemIdleLockEnabled = false,
  } = useSelector(getPreferences);

  const [selectedTimeLimit, setSelectedTimeLimit] = useState(autoLockTimeLimit);
  const [systemIdleLock, setSystemIdleLock] = useState(systemIdleLockEnabled);

  // Auto-lock time options
  const timeOptions = [
    { value: 0, label: t('always') },
    { value: 1, label: t('ifAwayFor1Min') },
    { value: 5, label: t('ifAwayFor5Mins') },
    { value: 30, label: t('ifAwayFor30Mins') },
    { value: 60, label: t('ifAwayFor1Hr') },
    { value: 240, label: t('ifAwayFor4Hr') },
    { value: null, label: t('never') },
  ];

  const handleTimeLimitChange = useCallback((value: number | null) => {
    setSelectedTimeLimit(value);
  }, []);

  const handleSave = useCallback(() => {
    dispatch(setAutoLockTimeLimit(selectedTimeLimit));
    dispatch(setSystemIdleLockEnabled(systemIdleLock));
    onClose();
  }, [selectedTimeLimit, systemIdleLock, dispatch, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedTimeLimit(autoLockTimeLimit);
    setSystemIdleLock(systemIdleLockEnabled);
    onClose();
  }, [autoLockTimeLimit, systemIdleLockEnabled, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        className="auto-lock-modal"
        modalDialogProps={{
          className: 'auto-lock-modal__dialog',
          padding: 0,
          display: Display.Flex,
          flexDirection: FlexDirection.Column,
        }}
      >
        <ModalHeader padding={4} onClose={onClose} onBack={onClose}>
          {t('autoLock')}
        </ModalHeader>

        <Box paddingLeft={4} paddingRight={4} paddingBottom={4} paddingTop={0}>
          {/* Auto Lock Time Limit */}
          <Box marginBottom={4}>
            <Text variant={TextVariant.bodyMd} marginBottom={2}>
              {t('autoLockTimeLimit')}
            </Text>
            <Text
              variant={TextVariant.bodySm}
              color={TextColor.textAlternative}
              marginBottom={3}
            >
              {t('autoLockTimeLimitDescription')}
            </Text>

            {/* Time Options List */}
            <Box>
              {timeOptions.map((option, index) => (
                <Box
                  key={index}
                  display={Display.Flex}
                  justifyContent={JustifyContent.spaceBetween}
                  alignItems={AlignItems.center}
                  padding={1}
                  onClick={() => handleTimeLimitChange(option.value)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedTimeLimit === option.value
                        ? '#f0f0f0'
                        : 'transparent',
                    borderRadius: '8px',
                  }}
                  data-testid={`time-option-${option.value}`}
                >
                  <Text
                    variant={TextVariant.bodyMd}
                    color={
                      selectedTimeLimit === option.value
                        ? TextColor.primaryDefault
                        : TextColor.textDefault
                    }
                  >
                    {option.label}
                  </Text>
                  {selectedTimeLimit === option.value && (
                    <Box
                      as="img"
                      src="./images/icons/check.svg"
                      alt="selected"
                      style={{ width: '20px', height: '20px' }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Divider */}
          <Box
            style={{
              height: '1px',
              backgroundColor: '#e5e5e5',
              marginBottom: '16px',
            }}
          />

          {/* System Idle Lock */}
          <Box marginBottom={4}>
            <Box
              display={Display.Flex}
              justifyContent={JustifyContent.spaceBetween}
              alignItems={AlignItems.center}
              marginBottom={2}
            >
              <Text variant={TextVariant.bodyMd}>{t('systemIdleLock')}</Text>
              <ToggleButton
                value={systemIdleLock}
                onToggle={() => setSystemIdleLock(!systemIdleLock)}
                data-testid="system-idle-lock-toggle"
              />
            </Box>
            <Text
              variant={TextVariant.bodySm}
              color={TextColor.textAlternative}
            >
              {t('systemIdleLockDescription')}
            </Text>
          </Box>

          {/* Action Buttons */}
          <Box
            display={Display.Flex}
            gap={2}
            justifyContent={JustifyContent.flexEnd}
          >
            <Button
              variant={ButtonVariant.Secondary}
              onClick={handleCancel}
              data-testid="auto-lock-cancel-button"
            >
              {t('cancel')}
            </Button>
            <Button
              variant={ButtonVariant.Primary}
              onClick={handleSave}
              data-testid="auto-lock-save-button"
            >
              {t('save')}
            </Button>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default AutoLockModal;

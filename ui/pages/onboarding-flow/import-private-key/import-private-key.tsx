import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  AlignItems,
  BlockSize,
  Display,
  FlexDirection,
  IconColor,
  JustifyContent,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_IMPORT_METHOD_SELECTOR_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getCurrentKeyring } from '../../../selectors';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsEventAccountType,
} from '../../../../shared/constants/metametrics';
import { getHDEntropyIndex } from '../../../selectors/selectors';
import {
  Text,
  Box,
  Button,
  IconName,
  ButtonIcon,
  ButtonIconSize,
  ButtonSize,
  FormTextField,
  TextFieldType,
} from '../../../components/component-library';
import { FormTextFieldSize } from '../../../components/component-library/form-text-field/form-text-field.types';
import { setCompletedOnboarding, setImportMethod } from '../../../store/actions';
import ShowHideToggle from '../../../components/ui/show-hide-toggle';
import * as actions from '../../../store/actions';
import { ImportMethod } from '../../../../shared/constants/onboarding';

interface ImportPrivateKeyProps {
  submitPrivateKey: (privateKey: string) => void;
}

export default function ImportPrivateKey({ submitPrivateKey }: ImportPrivateKeyProps) {
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyError, setPrivateKeyError] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const history = useHistory();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const t = useI18nContext();
  const currentKeyring = useSelector(getCurrentKeyring);
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);

  useEffect(() => {
    if (currentKeyring) {
      history.replace(ONBOARDING_CREATE_PASSWORD_ROUTE);
    }
  }, [currentKeyring, history]);

    const validatePrivateKey = (key: string): string => {
    // Basic validation for private key format
    if (!key || key.trim() === '') {
      return t('privateKeyRequired');
    }

    // Check if it's a valid hex string with 0x prefix or without
    const cleanKey = key.startsWith('0x') ? key.slice(2) : key;

    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
      return t('invalidPrivateKeyFormat');
    }

    return '';
  };

      const onContinue = useCallback(async () => {
    try {
      const error = validatePrivateKey(privateKey);
      setPrivateKeyError(error);

      if (error) {
        return;
      }

      // Set the import method to privateKey
      await dispatch(setImportMethod(ImportMethod.privateKey));

      // Clean the private key (remove 0x prefix if present)
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

      submitPrivateKey(cleanPrivateKey);

      trackEvent({
        category: MetaMetricsEventCategory.Onboarding,
        event: MetaMetricsEventName.OnboardingWalletSecurityPhraseConfirmed,
        properties: {
          hd_entropy_index: hdEntropyIndex,
          import_method: 'private_key',
        },
      });

      history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
    } catch (error) {
      console.error('Error in onContinue:', error);
      setPrivateKeyError('An error occurred. Please try again.');
    }
  }, [
    privateKey,
    t,
    hdEntropyIndex,
    trackEvent,
    history,
    submitPrivateKey,
    dispatch,
  ]);

  useEffect(() => {
    setPrivateKeyError('');
  }, [privateKey]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (privateKey !== '' && event.key === 'Enter') {
      event.preventDefault();
      onContinue();
    }
  };

  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      justifyContent={JustifyContent.spaceBetween}
      height={BlockSize.Full}
      gap={4}
      className="import-private-key"
      data-testid="import-private-key"
    >
      <Box>
        <Box marginBottom={4}>
          <ButtonIcon
            iconName={IconName.ArrowLeft}
            color={IconColor.iconDefault}
            size={ButtonIconSize.Md}
            data-testid="import-private-key-back-button"
            onClick={() => history.push(ONBOARDING_IMPORT_METHOD_SELECTOR_ROUTE)}
            ariaLabel={t('back')}
          />
        </Box>
        {/* <Box textAlign={TextAlign.Left}>
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
          >
            {t('stepOf', [2, 3])}
          </Text>
        </Box> */}
        <Box textAlign={TextAlign.Left} marginBottom={2}>
          <Text variant={TextVariant.headingLg}>{t('importAWallet')}</Text>
        </Box>
        <Box
          display={Display.Flex}
          alignItems={AlignItems.center}
          marginBottom={4}
        >
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
          >
            {t('pastePrivateKey')}
          </Text>
        </Box>
        <Box width={BlockSize.Full}>
          <FormTextField
            id="private-key-box"
            size={FormTextFieldSize.Lg}
            autoFocus
            label={t('pastePrivateKey')}
            value={privateKey}
            onChange={(event) => setPrivateKey(event.target.value)}
            inputProps={{
              onKeyPress: handleKeyPress,
            }}
            marginBottom={4}
            type={showPrivateKey ? TextFieldType.Text : TextFieldType.Password}
            textFieldProps={{
              endAccessory: (
                <ShowHideToggle
                  shown={showPrivateKey}
                  id="show-hide-private-key"
                  title={t('privateKeyShow')}
                  ariaLabelShown={t('privateKeyShown')}
                  ariaLabelHidden={t('privateKeyHidden')}
                  onChange={() => setShowPrivateKey(!showPrivateKey)}
                />
              ),
            }}
          />
          {privateKeyError && (
            <Box marginTop={2}>
              <Text
                data-testid="import-private-key-error"
                variant={TextVariant.bodySm}
                color={TextColor.errorDefault}
              >
                {privateKeyError}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
        width={BlockSize.Full}
        textAlign={TextAlign.Left}
      >
        <Button
          width={BlockSize.Full}
          size={ButtonSize.Lg}
          type="primary"
          data-testid="import-private-key-confirm"
          onClick={onContinue}
          disabled={!privateKey.trim() || Boolean(privateKeyError)}
        >
          {t('continue')}
        </Button>
      </Box>
    </Box>
  );
}

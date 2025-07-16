import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  JustifyContent,
  AlignItems,
  TextVariant,
  BlockSize,
  IconColor,
  Display,
  FlexDirection,
  TextAlign,
  TextColor,
} from '../../../helpers/constants/design-system';
import {
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_METAMETRICS,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import {
  getFirstTimeFlowType,
  getImportMethod,
  getCurrentKeyring,
  // getMetaMetricsId,
  // getParticipateInMetaMetrics,
} from '../../../selectors';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventAccountType,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonIconSize,
  ButtonSize,
  ButtonVariant,
  IconName,
  Text,
} from '../../../components/component-library';
import { FirstTimeFlowType, ImportMethod } from '../../../../shared/constants/onboarding';
import PasswordForm from '../../../components/app/password-form/password-form';
import LoadingScreen from '../../../components/ui/loading-screen';
import { PLATFORM_FIREFOX } from '../../../../shared/constants/app';
import { getBrowserName } from '../../../../shared/modules/browser-runtime.utils';
import { setCompletedOnboarding } from '../../../store/actions';

export default function CreatePassword({
  createNewAccount,
  importWithRecoveryPhrase,
  importWithPrivateKey,
  secretRecoveryPhrase,
  privateKey,
  setIsPrivateKeyImport,
}) {
  const t = useI18nContext();
  const [password, setPassword] = useState('');
  const [newAccountCreationInProgress, setNewAccountCreationInProgress] =
    useState(false);

  const history = useHistory();
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const importMethod = useSelector(getImportMethod);
  const trackEvent = useContext(MetaMetricsContext);
  const currentKeyring = useSelector(getCurrentKeyring);
  const dispatch = useDispatch();

  // const participateInMetaMetrics = useSelector(getParticipateInMetaMetrics);
  // const metametricsId = useSelector(getMetaMetricsId);
  // const base64MetametricsId = Buffer.from(metametricsId ?? '').toString(
  //   'base64',
  // );
  // const shouldInjectMetametricsIframe = Boolean(
  //   participateInMetaMetrics && base64MetametricsId,
  // );
  // const analyticsIframeQuery = {
  //   mmi: base64MetametricsId,
  //   env: 'production',
  // };
  // const analyticsIframeUrl = `https://start.metamask.io/?${new URLSearchParams(
  //   analyticsIframeQuery,
  // )}`;

    useEffect(() => {
    if (currentKeyring && !newAccountCreationInProgress) {
      // For private key import, we should go directly to the main page
      if (importMethod === ImportMethod.privateKey && firstTimeFlowType === FirstTimeFlowType.import) {
        history.replace(DEFAULT_ROUTE);
      } else if (firstTimeFlowType === FirstTimeFlowType.import) {
        history.replace(ONBOARDING_METAMETRICS);
      } else {
        history.replace(ONBOARDING_SECURE_YOUR_WALLET_ROUTE);
      }
    }
  }, [
    currentKeyring,
    history,
    firstTimeFlowType,
    importMethod,
    newAccountCreationInProgress,
  ]);

  const handleWalletImport = async () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletImportAttempted,
    });

    await importWithRecoveryPhrase(password, secretRecoveryPhrase);

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletImported,
      properties: {
        biometrics_enabled: false,
      },
    });

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletSetupCompleted,
      properties: {
        wallet_setup_type: 'import',
        new_wallet: false,
        account_type: MetaMetricsEventAccountType.Imported,
      },
    });

    if (getBrowserName() === PLATFORM_FIREFOX) {
      history.push(ONBOARDING_COMPLETION_ROUTE);
    } else {
      history.push(ONBOARDING_METAMETRICS);
    }
  };

  const handlePrivateKeyImport = async () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletImportAttempted,
      properties: {
        import_method: 'private_key',
      },
    });

    await importWithPrivateKey(password, privateKey);

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletImported,
      properties: {
        biometrics_enabled: false,
        import_method: 'private_key',
      },
    });

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletSetupCompleted,
      properties: {
        wallet_setup_type: 'import',
        new_wallet: false,
        account_type: MetaMetricsEventAccountType.Imported,
        import_method: 'private_key',
      },
    });

    // 新增：确保设置已完成onboarding
    await dispatch(setCompletedOnboarding(true));

    // 重置私钥导入状态
    if (setIsPrivateKeyImport) {
      setIsPrivateKeyImport(false);
    }

    // For private key import, go directly to the main page
    history.push(DEFAULT_ROUTE);
  };

  const handleCreateNewWallet = async () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletCreationAttempted,
      properties: {
        account_type: MetaMetricsEventAccountType.Default,
      },
    });

    if (createNewAccount) {
      setNewAccountCreationInProgress(true);
      await createNewAccount(password);
    }

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletSetupCompleted,
      properties: {
        wallet_setup_type: 'new',
        new_wallet: true,
        account_type: MetaMetricsEventAccountType.Default,
      },
    });

    history.push(ONBOARDING_SECURE_YOUR_WALLET_ROUTE);
  };

  const handleCreatePassword = async (event) => {
    event?.preventDefault();

    if (!password) {
      return;
    }

    try {
      // If importMethod is privateKey, we are in private key import flow
      if (
        importMethod === ImportMethod.privateKey &&
        firstTimeFlowType === FirstTimeFlowType.import
      ) {
        await handlePrivateKeyImport();
      }
      // If importMethod is seedPhrase, we are in import wallet flow
      else if (
        importMethod === ImportMethod.seedPhrase &&
        firstTimeFlowType === FirstTimeFlowType.import
      ) {
        await handleWalletImport();
      } else {
        // Otherwise we are in create new wallet flow
        await handleCreateNewWallet();
      }
    } catch (error) {
      trackEvent({
        category: MetaMetricsEventCategory.Onboarding,
        event: MetaMetricsEventName.WalletSetupFailure,
      });
    }
  };

  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      justifyContent={JustifyContent.spaceBetween}
      height={BlockSize.Full}
      gap={4}
      as="form"
      className="create-password"
      data-testid="create-password"
      onSubmit={handleCreatePassword}
    >
      <Box className="create-password__container">
        <Box
          display={Display.Flex}
          // justifyContent={JustifyContent.spaceBetween}
          flexDirection={FlexDirection.Row}
          alignItems={AlignItems.center}
          marginBottom={4}
          width={BlockSize.Full}
        >
          <ButtonIcon
            iconName={IconName.ArrowLeft}
            color={IconColor.iconDefault}
            size={ButtonIconSize.Md}
            data-testid="create-password-back-button"
            type="button"
            onClick={() => history.goBack()}
            ariaLabel={t('back')}
          />
          <Text variant={TextVariant.headingLg} as="h2">
            {t('setPassword')}
          </Text>
        </Box>
        {/* <Box textAlign={TextAlign.Left} marginBottom={2}>
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
          >
            {(() => {
              // Determine step based on flow type
              if (importMethod === ImportMethod.privateKey && firstTimeFlowType === FirstTimeFlowType.import) {
                // Private key import flow: step 2 of 3
                return t('stepOf', [2, 3]);
              } else if (importMethod === ImportMethod.seedPhrase && firstTimeFlowType === FirstTimeFlowType.import) {
                // Recovery phrase import flow: step 2 of 3
                return t('stepOf', [2, 3]);
              } else {
                // Create new wallet flow: step 1 of 3
                return t('stepOf', [1, 3]);
              }
            })()}
          </Text>
        </Box> */}
        <Box className="create-password__form">
          <PasswordForm onChange={(newPassword) => setPassword(newPassword)} />
        </Box>
      </Box>
      <Box>
        <Button
          data-testid="create-password-submit"
          variant={ButtonVariant.Primary}
          width={BlockSize.Full}
          size={ButtonSize.Lg}
          className="create-password__form--submit-button"
          disabled={!password}
        >
          {t('setPassword')}
        </Button>
      </Box>
      {/* {shouldInjectMetametricsIframe ? (
        <iframe
          src={analyticsIframeUrl}
          className="create-password__analytics-iframe"
          data-testid="create-password-iframe"
        />
      ) : null} */}
      {newAccountCreationInProgress && <LoadingScreen />}
    </Box>
  );
}

CreatePassword.propTypes = {
  createNewAccount: PropTypes.func,
  importWithRecoveryPhrase: PropTypes.func,
  importWithPrivateKey: PropTypes.func,
  secretRecoveryPhrase: PropTypes.string,
  privateKey: PropTypes.string,
  setIsPrivateKeyImport: PropTypes.func,
};

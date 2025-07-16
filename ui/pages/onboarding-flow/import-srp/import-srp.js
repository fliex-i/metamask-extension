import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { isValidMnemonic } from '@ethersproject/hdnode';
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
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SrpInputImport from '../../../components/app/srp-input-import';
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
  IconSize,
  Modal,
  ModalOverlay,
} from '../../../components/component-library';
import SRPDetailsModal from '../../../components/app/srp-details-modal';
import { ModalContent } from '../../../components/component-library/modal-content/deprecated';
import { ModalHeader } from '../../../components/component-library/modal-header';
import { setCompletedOnboarding, setImportMethod } from '../../../store/actions';
import { ImportMethod } from '../../../../shared/constants/onboarding';
import { ImportAccount } from '../../../components/multichain/import-account';

const hasUpperCase = (draftSrp) => {
  return draftSrp !== draftSrp.toLowerCase();
};
export default function ImportSRP({ submitSecretRecoveryPhrase }) {
  const dispatch = useDispatch();
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const [srpError, setSrpError] = useState('');
  const history = useHistory();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const t = useI18nContext();
  const currentKeyring = useSelector(getCurrentKeyring);

  useEffect(() => {
    if (currentKeyring) {
      history.replace(ONBOARDING_CREATE_PASSWORD_ROUTE);
    }
  }, [currentKeyring, history]);
  const trackEvent = useContext(MetaMetricsContext);

  const onShowSrpDetailsModal = useCallback(() => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.SrpDefinitionClicked,
      properties: {
        location: 'import_srp',
      },
    });
    setShowSrpDetailsModal(true);
  }, [trackEvent]);

  const onContinue = useCallback(async () => {
    let newSrpError = '';
    if (
      hasUpperCase(secretRecoveryPhrase) ||
      !isValidMnemonic(secretRecoveryPhrase)
    ) {
      newSrpError = t('invalidSeedPhraseNotFound');
    }

    setSrpError(newSrpError);

    if (newSrpError) {
      return;
    }

    // Set the import method to seedPhrase
    await dispatch(setImportMethod(ImportMethod.seedPhrase));

    submitSecretRecoveryPhrase(secretRecoveryPhrase);
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletSecurityPhraseConfirmed,
      properties: {
        hd_entropy_index: hdEntropyIndex,
      },
    });
    history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
  }, [
    secretRecoveryPhrase,
    t,
    hdEntropyIndex,
    trackEvent,
    history,
    submitSecretRecoveryPhrase,
    dispatch,
  ]);

  useEffect(() => {
    setSrpError('');
  }, [secretRecoveryPhrase]);

  const [isOpen, setIsOpen] = useState(false);

  const onActionComplete = useCallback(async (confirmed) => {
    if (confirmed) {
      trackEvent({
        category: MetaMetricsEventCategory.Navigation,
        event: MetaMetricsEventName.AccountAddSelected,
        properties: {
          account_type: MetaMetricsEventAccountType.Imported,
          location: 'Main Menu',
          hd_entropy_index: hdEntropyIndex,
        },
      });
      dispatch(setCompletedOnboarding());
      history.push(DEFAULT_ROUTE);
    }
    setIsOpen(false);
  }, []);

  return (
    <>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.spaceBetween}
        height={BlockSize.Full}
        gap={4}
        className="import-srp"
        data-testid="import-srp"
      >
        {showSrpDetailsModal && (
          <SRPDetailsModal onClose={() => setShowSrpDetailsModal(false)} />
        )}
        <Box>
          <Box marginBottom={4}>
            <ButtonIcon
              iconName={IconName.ArrowLeft}
              color={IconColor.iconDefault}
              size={ButtonIconSize.Md}
              data-testid="import-srp-back-button"
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
              {t('typeYourSRP')}
            </Text>
            <ButtonIcon
              iconName={IconName.Info}
              size={ButtonIconSize.Sm}
              color={IconColor.iconAlternative}
              onClick={onShowSrpDetailsModal}
              ariaLabel="info"
            />
          </Box>
          <Box width={BlockSize.Full}>
            <form onSubmit={(e) => e.preventDefault()}>
              <SrpInputImport onChange={setSecretRecoveryPhrase} />
              {srpError && (
                <Box marginTop={2}>
                  <Text
                    data-testid="import-srp-error"
                    variant={TextVariant.bodySm}
                    color={TextColor.errorDefault}
                  >
                    {srpError}
                  </Text>
                </Box>
              )}
            </form>
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
            data-testid="import-srp-confirm"
            onClick={onContinue}
            disabled={!secretRecoveryPhrase.trim() || Boolean(srpError)}
          >
            {t('continue')}
          </Button>
          {/* <Button
            width={BlockSize.Full}
            size={ButtonSize.Lg}
            startIconName={IconName.Key}
            startIconProps={{ size: IconSize.Md }}
            variant="secondary"
            data-testid="multichain-account-menu-popover-add-imported-account"
            style={{ marginTop: '12px' }}
            onClick={() => {
              trackEvent({
                category: MetaMetricsEventCategory.Navigation,
                event: MetaMetricsEventName.AccountAddSelected,
                properties: {
                  account_type: MetaMetricsEventAccountType.Imported,
                  location: 'Main Menu',
                  hd_entropy_index: hdEntropyIndex,
                },
              });
              setIsOpen(true);
            }}
          >
            {t('importPrivateKey')}
          </Button> */}
        </Box>
      </Box>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent
          className="multichain-account-menu-popover"
          modalDialogProps={{
            className: 'multichain-account-menu-popover__dialog',
            padding: 0,
            display: Display.Flex,
            flexDirection: FlexDirection.Column,
          }}
        >
          <ModalHeader
            padding={4}
            onClose={() => setIsOpen(false)}
            onBack={() => setIsOpen(false)}
          >
            {t('importPrivateKey')}
          </ModalHeader>
          <Box
            paddingLeft={4}
            paddingRight={4}
            paddingBottom={4}
            paddingTop={0}
          >
            <ImportAccount onActionComplete={onActionComplete} />
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}

ImportSRP.propTypes = {
  submitSecretRecoveryPhrase: PropTypes.func,
};

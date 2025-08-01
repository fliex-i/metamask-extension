import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  SETTINGS_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SrpInputImport from '../../../components/app/srp-input-import';
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
} from '../../../components/component-library';
import SRPDetailsModal from '../../../components/app/srp-details-modal';
import * as actions from '../../../store/actions';
import { setShowNewSrpAddedToast } from '../../../components/app/toast-master/utils';

const hasUpperCase = (draftSrp: string) => {
  return draftSrp !== draftSrp.toLowerCase();
};

export default function ImportSrpSettings() {
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const [srpError, setSrpError] = useState('');
  const history = useHistory();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const t = useI18nContext();
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);

  const onShowSrpDetailsModal = useCallback(() => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.SrpDefinitionClicked,
      properties: {
        location: 'import_srp_settings',
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
      newSrpError = `${t('invalidSeedPhraseNotFound')}\n${t(
        'invalidSeedPhraseNotFound1',
      )}`;
    }

    setSrpError(newSrpError);

    if (newSrpError) {
      return;
    }

    try {
      await dispatch(actions.importMnemonicToVault(secretRecoveryPhrase));
      history.push(DEFAULT_ROUTE);
      dispatch(setShowNewSrpAddedToast(true));
      trackEvent({
        category: MetaMetricsEventCategory.Navigation,
        event: MetaMetricsEventName.ImportSecretRecoveryPhraseCompleted,
        properties: {
          hd_entropy_index: hdEntropyIndex,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          'This Secret Recovery Phrase has already been imported.'
      ) {
        setSrpError(t('duplicateAccountError1'));
      } else {
        setSrpError(
          error instanceof Error
            ? error.message
            : t('importSecretRecoveryPhraseUnknownError'),
        );
      }
    }
  }, [secretRecoveryPhrase, t, hdEntropyIndex, trackEvent, history, dispatch]);

  useEffect(() => {
    setSrpError('');
  }, [secretRecoveryPhrase]);

  return (
    <>
      <Box className="import-srp-settings">
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          justifyContent={JustifyContent.spaceBetween}
          height={BlockSize.Full}
          gap={4}
          className="import-srp-settings__container"
          data-testid="import-srp-settings"
        >
          {showSrpDetailsModal && (
            <SRPDetailsModal onClose={() => setShowSrpDetailsModal(false)} />
          )}
          <Box>
            <Box
              marginBottom={4}
              display={Display.Flex}
              alignItems={AlignItems.center}
              gap={2}
            >
              <ButtonIcon
                iconName={IconName.ArrowLeft}
                color={IconColor.iconDefault}
                size={ButtonIconSize.Md}
                data-testid="import-srp-settings-back-button"
                onClick={() => history.push(SETTINGS_ROUTE)}
                ariaLabel={t('back')}
                style={{ background: '#EDEDED', borderRadius: '99px' }}
              />
              <Text variant={TextVariant.headingLg}>{t('importSrp')}</Text>
            </Box>
            <Text variant={TextVariant.bodyMd}>{t('importPrivateKeys')}</Text>
            <br />
            <Text variant={TextVariant.bodyMd}>{t('importPrivateKeys1')}</Text>
            <br />
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
                      data-testid="import-srp-settings-error"
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
              data-testid="import-srp-settings-confirm"
              onClick={onContinue}
              disabled={!secretRecoveryPhrase.trim() || Boolean(srpError)}
            >
              {t('importSrpBtn')}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

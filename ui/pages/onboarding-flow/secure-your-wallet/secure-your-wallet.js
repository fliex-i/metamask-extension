import React, { useState, useContext, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  TextVariant,
  JustifyContent,
  AlignItems,
  FlexDirection,
  Display,
  BlockSize,
  TextColor,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { ONBOARDING_REVIEW_SRP_ROUTE } from '../../../helpers/constants/routes';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  Box,
  Button,
  Text,
  ButtonSize,
  ButtonLink,
  ButtonLinkSize,
} from '../../../components/component-library';
import { getHDEntropyIndex } from '../../../selectors/selectors';
import SRPDetailsModal from '../../../components/app/srp-details-modal';
import SkipSRPBackup from './skip-srp-backup-popover';

export default function SecureYourWallet() {
  const history = useHistory();
  const t = useI18nContext();
  const { search } = useLocation();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const [showSkipSRPBackupPopover, setShowSkipSRPBackupPopover] =
    useState(false);
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const searchParams = new URLSearchParams(search);
  const isFromReminderParam = searchParams.get('isFromReminder')
    ? '/?isFromReminder=true'
    : '';

  const trackEvent = useContext(MetaMetricsContext);

  const handleOnShowSrpDetailsModal = useCallback(() => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.SrpDefinitionClicked,
      properties: {
        location: 'secure_your_wallet',
      },
    });
    setShowSrpDetailsModal(true);
  }, [trackEvent]);

  const handleClickRecommended = () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletSecurityStarted,
      properties: {
        hd_entropy_index: hdEntropyIndex,
      },
    });
    history.push(`${ONBOARDING_REVIEW_SRP_ROUTE}${isFromReminderParam}`);
  };

  const items = [
    t('secureWalletWalletSaveSrp', [
      [
        <ButtonLink
          key="secureWalletWalletSaveSrp"
          size={ButtonLinkSize.Inherit}
          onClick={handleOnShowSrpDetailsModal}
        >
          {t('secretRecoveryPhrase')}
        </ButtonLink>,
      ],
    ]),
    t('secureWalletWalletSaveSrp2'),
    t('secureWalletWalletSaveSrp3'),
    t('secureWalletWalletSaveSrp4'),
    t('secureWalletWalletSaveSrp5'),
  ];

  return (
    <Box
      display={Display.Flex}
      justifyContent={JustifyContent.spaceBetween}
      alignItems={AlignItems.flexStart}
      flexDirection={FlexDirection.Column}
      gap={4}
      height={BlockSize.Full}
      className="secure-your-wallet"
      data-testid="secure-your-wallet"
    >
      <Box>
        {showSkipSRPBackupPopover && (
          <SkipSRPBackup
            onClose={() => setShowSkipSRPBackupPopover(false)}
            secureYourWallet={handleClickRecommended}
          />
        )}
        {showSrpDetailsModal && (
          <SRPDetailsModal onClose={() => setShowSrpDetailsModal(false)} />
        )}
        <Box
          justifyContent={JustifyContent.flexStart}
          marginBottom={4}
          width={BlockSize.Full}
        >
          <Text variant={TextVariant.headingLg} as="h2">
            {t('seedPhraseIntroTitle')}
          </Text>
        </Box>
        <Box>
          {items.map((item, index) => (
            <Box
              key={index}
              display={Display.Flex}
              alignItems={AlignItems.center}
              marginBottom={6}
              gap={3}
            >
              <img
                src={`./images/home/secure${index + 1}.svg`}
                alt=""
                style={{ width: 36, height: 36 }}
              />
              <Text color={TextColor.textAlternative} as="div">
                {item}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        width={BlockSize.Full}
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        gap={4}
      >
        <Button
          data-testid="secure-wallet-recommended"
          size={ButtonSize.Lg}
          block
          onClick={handleClickRecommended}
        >
          {t('secureWalletGetStartedButton')}
        </Button>
      </Box>
    </Box>
  );
}

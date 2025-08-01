// import EventEmitter from 'events';
import React from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
// import Mascot from '../../../components/ui/mascot';
import {
  Box,
  ButtonBase,
  ButtonBaseSize,
  Text,
} from '../../../components/component-library';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  Display,
  FlexDirection,
  JustifyContent,
  TextAlign,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';
import ExpandableInputButton from '../../../components/ui/expandable-input-button';
import { getCurrentLocale } from '../../../ducks/locale/locale';

type WelcomeLoginProps = {
  onCreate: () => void;
  onImport: () => void;
};

export default function WelcomeLogin({
  onCreate,
  onImport,
}: WelcomeLoginProps) {
  const t = useI18nContext();
  const currentLocale = useSelector(getCurrentLocale);

  // Determine the terms and conditions URL based on current locale
  const termsConditionsUrl = currentLocale === 'ja'
    ? 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84_JP.pdf'
    : 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_Terms_and_Conditions_EN.pdf';

  // Determine the privacy policy URL based on current locale
  const privacyPolicyUrl = currentLocale === 'ja'
    ? 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_%E3%83%95%E3%82%9A%E3%83%A9%E3%82%A4%E3%83%8F%E3%82%99%E3%82%B7%E3%83%BC%E3%83%9B%E3%82%9A%E3%83%AA%E3%82%B7%E3%83%BC_JP.pdf'
    : 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_Privacy_Policy_EN.pdf';

  return (
    <Box
      style={{ height: '100%' }}
      display={Display.Flex}
      justifyContent={JustifyContent.center}
      alignItems={AlignItems.center}
    >
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
        marginInline="auto"
        marginTop={2}
        padding={6}
        className="welcome-login"
        data-testid="get-started"
      >
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          alignItems={AlignItems.center}
          justifyContent={JustifyContent.center}
          className="welcome-login__content"
        >
          <Box
            className={classnames('welcome-login__mascot', {
              'welcome-login__mascot--image': isFlask() || isBeta(),
            })}
          >
            {/* {renderMascot()} */}
            <img
              src="./images/cryptobridge/logo-3d.png"
              width="308"
              height="240"
            />
          </Box>
          <Text
            marginInline={5}
            textAlign={TextAlign.Center}
            as="h2"
            className="welcome-login__title"
            data-testid="onboarding-welcome"
          >
            {t('welcomeTitle')}
          </Text>
          <Text
            marginInline={5}
            textAlign={TextAlign.Center}
            as="h3"
            className="welcome-login__description"
            data-testid="onboarding-desc"
          >
            {t('welcomeDescription')} <br />
            {t('welcomeDescription1')} <br />
            {t('welcomeDescription2')}
          </Text>
        </Box>

        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          gap={4}
        >
          <ButtonBase
            data-testid="onboarding-create-wallet"
            width={BlockSize.Full}
            size={ButtonBaseSize.Lg}
            className="welcome-login__create-button"
            onClick={onCreate}
          >
            {t('onboardingCreateWallet')}
          </ButtonBase>
          <ButtonBase
            data-testid="onboarding-import-wallet"
            width={BlockSize.Full}
            size={ButtonBaseSize.Lg}
            backgroundColor={BackgroundColor.transparent}
            className="welcome-login__import-button"
            onClick={onImport}
          >
            {t('onboardingImportWallet')}
          </ButtonBase>
        </Box>

        {/* <ExpandableInputButton
          buttonText={t('referralCode')}
          inputPlaceholder={t('referralCodeInputPlace')}
          onInputChange={(value: string) => console.log(value)}
          onButtonClick={() => console.log('Button clicked')}
        /> */}

        <Box className="welcome-login__footer">
          <Box className="welcome-login__footer__text" as="span">
            {t('footerAgreementDesc')}
          </Box>
          <Box
            type="link"
            as="a"
            href={termsConditionsUrl}
            target="_blank"
            className="welcome-login__footer__link"
          >
            {`${t('termsConditions')} `}
          </Box>
          <Box as="span" className="welcome-login__footer__text">
            {t('footerAgreementDesc1')}
          </Box>
          <Box
            type="link"
            as="a"
            href={privacyPolicyUrl}
            target="_blank"
            className="welcome-login__footer__link"
          >
            {t('privacyPolicy')}
          </Box>
          <Box as="span" className="welcome-login__footer__text">
            {t('footerAgreementDesc2')}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { generateMnemonic, validateMnemonic } from 'bip39';
import Unlock from '../unlock-page';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-flask)
  ONBOARDING_EXPERIMENTAL_AREA,
  ///: END:ONLY_INCLUDE_IF
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_REVIEW_SRP_ROUTE,
  ONBOARDING_CONFIRM_SRP_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
  DEFAULT_ROUTE,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_PRIVACY_SETTINGS_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
  ONBOARDING_PIN_EXTENSION_ROUTE,
  ONBOARDING_METAMETRICS,
  ONBOARDING_ACCOUNT_EXIST,
  ONBOARDING_ACCOUNT_NOT_FOUND,
} from '../../helpers/constants/routes';
import {
  getCompletedOnboarding,
  getIsUnlocked,
} from '../../ducks/metamask/metamask';
import {
  createNewVaultAndGetSeedPhrase,
  unlockAndGetSeedPhrase,
  createNewVaultAndRestore,
} from '../../store/actions';
import {
  getFirstTimeFlowTypeRouteAfterUnlock,
  getShowTermsOfUse,
} from '../../selectors';
// import { MetaMetricsContext } from '../../contexts/metametrics';
// import Button from '../../components/ui/button';
import RevealSRPModal from '../../components/app/reveal-SRP-modal';
// import { useI18nContext } from '../../hooks/useI18nContext';
// import {
//   MetaMetricsEventCategory,
//   MetaMetricsEventName,
// } from '../../../shared/constants/metametrics';
///: BEGIN:ONLY_INCLUDE_IF(build-flask)
import ExperimentalArea from '../../components/app/flask/experimental-area';
///: END:ONLY_INCLUDE_IF
import { submitRequestToBackgroundAndCatch } from '../../components/app/toast-master/utils';
// import { getHDEntropyIndex } from '../../selectors/selectors';
import { Box } from '../../components/component-library';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  BorderColor,
  BorderRadius,
  BorderStyle,
  Display,
  FlexDirection,
  JustifyContent,
} from '../../helpers/constants/design-system';
// eslint-disable-next-line import/no-restricted-paths
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../shared/constants/app';
import { getLocale } from '../../selectors/selectors';
import OnboardingFlowSwitch from './onboarding-flow-switch/onboarding-flow-switch';
import CreatePassword from './create-password/create-password';
import ReviewRecoveryPhrase from './recovery-phrase/review-recovery-phrase';
import SecureYourWallet from './secure-your-wallet/secure-your-wallet';
import ConfirmRecoveryPhrase from './recovery-phrase/confirm-recovery-phrase';
import PrivacySettings from './privacy-settings/privacy-settings';
import CreationSuccessful from './creation-successful/creation-successful';
import OnboardingWelcome from './welcome/welcome';
import ImportSRP from './import-srp/import-srp';
import OnboardingPinExtension from './pin-extension/pin-extension';
import MetaMetricsComponent from './metametrics/metametrics';
import OnboardingAppHeader from './onboarding-app-header/onboarding-app-header';
import { WelcomePageState } from './welcome/types';
import AccountExist from './account-exist/account-exist';
import AccountNotFound from './account-not-found/account-not-found';

// const TWITTER_URL = 'https://twitter.com/MetaMask';

export default function OnboardingFlow() {
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const [secretRecoveryPhrase24, setSecretRecoveryPhrase24] = useState('');
  const [selectedPhraseType, setSelectedPhraseType] = useState('12'); // '12' 或 '24'
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const history = useHistory();
  // const t = useI18nContext();
  // const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const completedOnboarding = useSelector(getCompletedOnboarding);
  const nextRoute = useSelector(getFirstTimeFlowTypeRouteAfterUnlock);
  const isFromReminder = new URLSearchParams(search).get('isFromReminder');
  // const trackEvent = useContext(MetaMetricsContext);
  const isUnlocked = useSelector(getIsUnlocked);
  const showTermsOfUse = useSelector(getShowTermsOfUse);
  const currentLocale = useSelector(getLocale);

  const envType = getEnvironmentType();
  const isPopup = envType === ENVIRONMENT_TYPE_POPUP;

  // 判断需要垂直居中的页面
  const isCenterPage =
    pathname === ONBOARDING_CREATE_PASSWORD_ROUTE ||
    pathname === ONBOARDING_SECURE_YOUR_WALLET_ROUTE ||
    pathname === ONBOARDING_REVIEW_SRP_ROUTE ||
    pathname === ONBOARDING_CONFIRM_SRP_ROUTE ||
    pathname === ONBOARDING_IMPORT_WITH_SRP_ROUTE ||
    pathname === ONBOARDING_METAMETRICS ||
    pathname === ONBOARDING_COMPLETION_ROUTE;

  // If the user has not agreed to the terms of use, we show the banner
  // Otherwise, we show the login page
  const [welcomePageState, setWelcomePageState] = useState(
    WelcomePageState.Login,
  );

  useEffect(() => {
    setOnboardingDate();
  }, []);

  useEffect(() => {
    if (completedOnboarding && !isFromReminder) {
      history.push(DEFAULT_ROUTE);
    }
  }, [history, completedOnboarding, isFromReminder]);

  useEffect(() => {
    if (isUnlocked && !completedOnboarding && !secretRecoveryPhrase) {
      const needsSRP = [
        ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
        ONBOARDING_REVIEW_SRP_ROUTE,
        ONBOARDING_CONFIRM_SRP_ROUTE,
      ].some((route) => pathname.startsWith(route));

      if (needsSRP) {
        history.push(ONBOARDING_UNLOCK_ROUTE);
      }
    }
    if (
      pathname === ONBOARDING_WELCOME_ROUTE ||
      pathname === ONBOARDING_CREATE_PASSWORD_ROUTE ||
      pathname === ONBOARDING_SECURE_YOUR_WALLET_ROUTE ||
      pathname === ONBOARDING_REVIEW_SRP_ROUTE ||
      pathname === ONBOARDING_CONFIRM_SRP_ROUTE ||
      pathname === ONBOARDING_IMPORT_WITH_SRP_ROUTE ||
      pathname === ONBOARDING_METAMETRICS ||
      pathname === ONBOARDING_COMPLETION_ROUTE
    ) {
      setWelcomePageState(WelcomePageState.Login);
      // showTermsOfUse ? WelcomePageState.Banner :
    } else {
      setWelcomePageState(null);
    }
  }, [
    isUnlocked,
    completedOnboarding,
    secretRecoveryPhrase,
    pathname,
    history,
    showTermsOfUse,
  ]);

  const handleCreateNewAccount = async (password, phraseType = '12') => {
    try {
      // 生成24个助记词
      const mnemonic24 = generateMnemonic(256);
      console.log('Is valid:', validateMnemonic(mnemonic24));
      console.log('Generated 24-word mnemonic:');
      console.log(mnemonic24);
      console.log('Word count:', mnemonic24.split(' ').length);

      // 根据用户选择创建不同的钱包
      if (phraseType === '24') {
        // 使用24个助记词创建钱包
        await dispatch(createNewVaultAndRestore(password, mnemonic24));
        setSecretRecoveryPhrase(mnemonic24);
        setSecretRecoveryPhrase24(mnemonic24);
        setSelectedPhraseType('24');
      } else {
        // 使用标准的12个助记词创建钱包
        const newSecretRecoveryPhrase = await dispatch(
          createNewVaultAndGetSeedPhrase(password),
        );
        setSecretRecoveryPhrase(newSecretRecoveryPhrase);
        setSecretRecoveryPhrase24(mnemonic24);
        setSelectedPhraseType('12');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnlock = async (password) => {
    const retrievedSecretRecoveryPhrase = await dispatch(
      unlockAndGetSeedPhrase(password),
    );

    // 检测助记词类型（12个或24个单词）
    const wordCount = retrievedSecretRecoveryPhrase.split(' ').length;
    const phraseType = wordCount === 24 ? '24' : '12';

    setSecretRecoveryPhrase(retrievedSecretRecoveryPhrase);
    setSecretRecoveryPhrase24(retrievedSecretRecoveryPhrase);
    setSelectedPhraseType(phraseType);

    history.push(nextRoute);
  };

  const handleImportWithRecoveryPhrase = async (password, srp) => {
    // 检测助记词类型（12个或24个单词）
    const wordCount = srp.split(' ').length;
    const phraseType = wordCount === 24 ? '24' : '12';
    setSelectedPhraseType(phraseType);

    return await dispatch(createNewVaultAndRestore(password, srp));
  };

  const showPasswordModalToAllowSRPReveal =
    pathname === `${ONBOARDING_REVIEW_SRP_ROUTE}/` &&
    completedOnboarding &&
    !secretRecoveryPhrase &&
    isFromReminder;

  const isWelcomeAndUnlockPage =
    pathname === ONBOARDING_WELCOME_ROUTE ||
    pathname === ONBOARDING_UNLOCK_ROUTE;

  return (
    <Box
      backgroundColor={BackgroundColor.backgroundDefault}
      width={BlockSize.Full}
      height={BlockSize.Full}
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      alignItems={
        pathname === ONBOARDING_WELCOME_ROUTE
          ? AlignItems.flexStart
          : AlignItems.center
      }
      justifyContent={JustifyContent.flexStart}
      className={classnames('onboarding-flow', {
        'onboarding-flow--welcome-banner':
          welcomePageState === WelcomePageState.Banner,
        'onboarding-flow--welcome-login':
          welcomePageState === WelcomePageState.Login,
      })}
    >
      {!isPopup && (
        <a
          href={
            currentLocale === 'en'
              ? 'https://www.crypto-bridge.co/#support'
              : 'https://www.crypto-bridge.co/jp/#support'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="onboarding-flow--welcome-login__support"
        >
          <img src="/images/home/support.svg" alt="Support" />
        </a>
      )}
      {!isPopup && <OnboardingAppHeader pageState={welcomePageState} />}
      <RevealSRPModal
        setSecretRecoveryPhrase={setSecretRecoveryPhrase}
        onClose={() => history.goBack()}
        isOpen={showPasswordModalToAllowSRPReveal}
      />
      {isCenterPage ? (
        <Box
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
          style={{ height: '100%' }}
        >
          <Box
            paddingInline={isWelcomeAndUnlockPage ? 0 : 6}
            paddingTop={isWelcomeAndUnlockPage ? 0 : 8}
            paddingBottom={isWelcomeAndUnlockPage ? 0 : 8}
            // width={BlockSize.Full}
            borderStyle={
              isWelcomeAndUnlockPage || isPopup
                ? BorderStyle.none
                : BorderStyle.solid
            }
            borderRadius={BorderRadius.LG}
            marginInline="auto"
            borderColor={BorderColor.borderMuted}
            style={{
              maxWidth: isWelcomeAndUnlockPage ? 'none' : '584px',
              width: isWelcomeAndUnlockPage ? '100%' : '584px',
              minHeight: isWelcomeAndUnlockPage ? 'auto' : '627px',
              height:
                pathname === ONBOARDING_WELCOME_ROUTE || isPopup
                  ? '100%'
                  : 'auto',
              backgroundColor:
                pathname === ONBOARDING_CREATE_PASSWORD_ROUTE ||
                pathname === ONBOARDING_SECURE_YOUR_WALLET_ROUTE ||
                pathname === ONBOARDING_REVIEW_SRP_ROUTE ||
                pathname === ONBOARDING_CONFIRM_SRP_ROUTE ||
                pathname === ONBOARDING_IMPORT_WITH_SRP_ROUTE ||
                pathname === ONBOARDING_METAMETRICS ||
                pathname === ONBOARDING_COMPLETION_ROUTE
                  ? 'white'
                  : 'transparent',
            }}
          >
            <Switch>
              <Route path={ONBOARDING_ACCOUNT_EXIST} component={AccountExist} />
              <Route
                path={ONBOARDING_ACCOUNT_NOT_FOUND}
                component={AccountNotFound}
              />
              <Route
                path={ONBOARDING_CREATE_PASSWORD_ROUTE}
                render={(routeProps) => (
                  <CreatePassword
                    {...routeProps}
                    createNewAccount={handleCreateNewAccount}
                    importWithRecoveryPhrase={handleImportWithRecoveryPhrase}
                    secretRecoveryPhrase={secretRecoveryPhrase}
                  />
                )}
              />
              <Route
                path={ONBOARDING_SECURE_YOUR_WALLET_ROUTE}
                component={SecureYourWallet}
              />
              <Route
                path={ONBOARDING_REVIEW_SRP_ROUTE}
                render={() => (
                  <ReviewRecoveryPhrase
                    secretRecoveryPhrase={secretRecoveryPhrase}
                    secretRecoveryPhrase24={secretRecoveryPhrase24}
                    selectedPhraseType={selectedPhraseType}
                    onPhraseTypeSelect={setSelectedPhraseType}
                  />
                )}
              />
              <Route
                path={ONBOARDING_CONFIRM_SRP_ROUTE}
                render={() => (
                  <ConfirmRecoveryPhrase
                    secretRecoveryPhrase={secretRecoveryPhrase}
                    secretRecoveryPhrase24={secretRecoveryPhrase24}
                    selectedPhraseType={selectedPhraseType}
                  />
                )}
              />
              <Route
                path={ONBOARDING_IMPORT_WITH_SRP_ROUTE}
                render={(routeProps) => (
                  <ImportSRP
                    {...routeProps}
                    submitSecretRecoveryPhrase={setSecretRecoveryPhrase}
                  />
                )}
              />
              <Route
                path={ONBOARDING_UNLOCK_ROUTE}
                render={(routeProps) => (
                  <Unlock {...routeProps} onSubmit={handleUnlock} />
                )}
              />
              <Route
                path={ONBOARDING_PRIVACY_SETTINGS_ROUTE}
                component={PrivacySettings}
              />
              <Route
                path={ONBOARDING_COMPLETION_ROUTE}
                component={CreationSuccessful}
              />
              <Route
                path={ONBOARDING_WELCOME_ROUTE}
                render={(routeProps) => (
                  <OnboardingWelcome
                    {...routeProps}
                    pageState={welcomePageState}
                    setPageState={setWelcomePageState}
                  />
                )}
              />
              <Route
                path={ONBOARDING_PIN_EXTENSION_ROUTE}
                component={OnboardingPinExtension}
              />
              <Route
                path={ONBOARDING_METAMETRICS}
                component={MetaMetricsComponent}
              />
              {
                ///: BEGIN:ONLY_INCLUDE_IF(build-flask)
              }
              <Route
                path={ONBOARDING_EXPERIMENTAL_AREA}
                render={(routeProps) => (
                  <ExperimentalArea
                    {...routeProps}
                    redirectTo={ONBOARDING_WELCOME_ROUTE}
                  />
                )}
              />
              {
                ///: END:ONLY_INCLUDE_IF
              }
              <Route exact path="*" component={OnboardingFlowSwitch} />
            </Switch>
          </Box>
        </Box>
      ) : (
        <Box
          paddingInline={isWelcomeAndUnlockPage ? 0 : 6}
          paddingTop={isWelcomeAndUnlockPage ? 0 : 8}
          paddingBottom={isWelcomeAndUnlockPage ? 0 : 8}
          width={BlockSize.Full}
          borderStyle={
            isWelcomeAndUnlockPage || isPopup
              ? BorderStyle.none
              : BorderStyle.solid
          }
          borderRadius={BorderRadius.LG}
          marginTop={pathname === ONBOARDING_WELCOME_ROUTE || isPopup ? 0 : 3}
          marginInline="auto"
          borderColor={BorderColor.borderMuted}
          style={{
            maxWidth: isWelcomeAndUnlockPage ? 'none' : '584px',
            minHeight: isWelcomeAndUnlockPage ? 'auto' : '627px',
            height:
              pathname === ONBOARDING_WELCOME_ROUTE || isPopup
                ? '100%'
                : 'auto',
            backgroundColor:
              pathname === ONBOARDING_CREATE_PASSWORD_ROUTE ||
              pathname === ONBOARDING_SECURE_YOUR_WALLET_ROUTE ||
              pathname === ONBOARDING_REVIEW_SRP_ROUTE ||
              pathname === ONBOARDING_CONFIRM_SRP_ROUTE ||
              pathname === ONBOARDING_IMPORT_WITH_SRP_ROUTE ||
              pathname === ONBOARDING_METAMETRICS ||
              pathname === ONBOARDING_COMPLETION_ROUTE
                ? 'white'
                : 'transparent',
          }}
        >
          <Switch>
            <Route path={ONBOARDING_ACCOUNT_EXIST} component={AccountExist} />
            <Route
              path={ONBOARDING_ACCOUNT_NOT_FOUND}
              component={AccountNotFound}
            />
            <Route
              path={ONBOARDING_CREATE_PASSWORD_ROUTE}
              render={(routeProps) => (
                <CreatePassword
                  {...routeProps}
                  createNewAccount={handleCreateNewAccount}
                  importWithRecoveryPhrase={handleImportWithRecoveryPhrase}
                  secretRecoveryPhrase={secretRecoveryPhrase}
                />
              )}
            />
            <Route
              path={ONBOARDING_SECURE_YOUR_WALLET_ROUTE}
              component={SecureYourWallet}
            />
            <Route
              path={ONBOARDING_REVIEW_SRP_ROUTE}
              render={() => (
                <ReviewRecoveryPhrase
                  secretRecoveryPhrase={secretRecoveryPhrase}
                  secretRecoveryPhrase24={secretRecoveryPhrase24}
                  selectedPhraseType={selectedPhraseType}
                  onPhraseTypeSelect={setSelectedPhraseType}
                />
              )}
            />
            <Route
              path={ONBOARDING_CONFIRM_SRP_ROUTE}
              render={() => (
                <ConfirmRecoveryPhrase
                  secretRecoveryPhrase={secretRecoveryPhrase}
                  secretRecoveryPhrase24={secretRecoveryPhrase24}
                  selectedPhraseType={selectedPhraseType}
                />
              )}
            />
            <Route
              path={ONBOARDING_IMPORT_WITH_SRP_ROUTE}
              render={(routeProps) => (
                <ImportSRP
                  {...routeProps}
                  submitSecretRecoveryPhrase={setSecretRecoveryPhrase}
                />
              )}
            />
            <Route
              path={ONBOARDING_UNLOCK_ROUTE}
              render={(routeProps) => (
                <Unlock {...routeProps} onSubmit={handleUnlock} />
              )}
            />
            <Route
              path={ONBOARDING_PRIVACY_SETTINGS_ROUTE}
              component={PrivacySettings}
            />
            <Route
              path={ONBOARDING_COMPLETION_ROUTE}
              component={CreationSuccessful}
            />
            <Route
              path={ONBOARDING_WELCOME_ROUTE}
              render={(routeProps) => (
                <OnboardingWelcome
                  {...routeProps}
                  pageState={welcomePageState}
                  setPageState={setWelcomePageState}
                />
              )}
            />
            <Route
              path={ONBOARDING_PIN_EXTENSION_ROUTE}
              component={OnboardingPinExtension}
            />
            <Route
              path={ONBOARDING_METAMETRICS}
              component={MetaMetricsComponent}
            />
            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-flask)
            }
            <Route
              path={ONBOARDING_EXPERIMENTAL_AREA}
              render={(routeProps) => (
                <ExperimentalArea
                  {...routeProps}
                  redirectTo={ONBOARDING_WELCOME_ROUTE}
                />
              )}
            />
            {
              ///: END:ONLY_INCLUDE_IF
            }
            <Route exact path="*" component={OnboardingFlowSwitch} />
          </Switch>
        </Box>
      )}
    </Box>
  );
}

function setOnboardingDate() {
  submitRequestToBackgroundAndCatch('setOnboardingDate');
}

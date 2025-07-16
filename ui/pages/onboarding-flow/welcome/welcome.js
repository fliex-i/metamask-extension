import React, { useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_IMPORT_METHOD_SELECTOR_ROUTE,
} from '../../../helpers/constants/routes';
import {
  getFirstTimeFlowType,
  getParticipateInMetaMetrics,
} from '../../../selectors';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventAccountType,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { setFirstTimeFlowType } from '../../../store/actions';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import WelcomeBanner from './welcome-banner';
import WelcomeLogin from './welcome-login';
import LoadingScreen from '../../../components/ui/loading-screen';
import { WelcomePageState } from './types';

export default function OnboardingWelcome({
  pageState = WelcomePageState.Login,
  setPageState,
}) {
  const t = useI18nContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const participateInMetaMetrics = useSelector(getParticipateInMetaMetrics);

  const onCreateClick = useCallback(async () => {
    setIsLoggingIn(true);
    await dispatch(setFirstTimeFlowType(FirstTimeFlowType.create));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletCreationStarted,
      properties: {
        account_type: MetaMetricsEventAccountType.Default,
      },
    });

    history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
  }, [dispatch, history, trackEvent]);

  const onImportClick = useCallback(async () => {
    setIsLoggingIn(true);
    await dispatch(setFirstTimeFlowType(FirstTimeFlowType.import));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletImportStarted,
      properties: {
        account_type: MetaMetricsEventAccountType.Imported,
      },
    });

    history.push(ONBOARDING_IMPORT_METHOD_SELECTOR_ROUTE);
  }, [dispatch, history, trackEvent]);

  const onImportPrivateKeyClick = useCallback(async () => {
    setIsLoggingIn(true);
    await dispatch(setFirstTimeFlowType(FirstTimeFlowType.import));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.WalletImportStarted,
      properties: {
        account_type: MetaMetricsEventAccountType.Imported,
        import_method: 'private_key',
      },
    });

    history.push(ONBOARDING_IMPORT_METHOD_SELECTOR_ROUTE);
  }, [dispatch, history, trackEvent]);

  return (
    <>
      {pageState === WelcomePageState.Banner && (
        <WelcomeBanner onAccept={() => setPageState(WelcomePageState.Login)} />
      )}
      {pageState === WelcomePageState.Login && (
        <WelcomeLogin
          onCreate={onCreateClick}
          onImport={onImportClick}
          onImportPrivateKey={onImportPrivateKeyClick}
        />
      )}
      {isLoggingIn && <LoadingScreen />}
    </>
  );
}

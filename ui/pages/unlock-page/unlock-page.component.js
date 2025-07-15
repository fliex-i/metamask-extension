import { EventEmitter } from 'events';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  FormTextField,
  Box,
  ButtonLink,
  Button,
  ButtonSize,
  ButtonVariant,
  InputType,
  FormTextFieldSize,
  ButtonIcon,
  IconName,
} from '../../components/component-library';
import {
  TextVariant,
  TextColor,
  BlockSize,
  BorderRadius,
  Display,
  JustifyContent,
  AlignItems,
  FlexDirection,
  TextAlign,
  BackgroundColor,
} from '../../helpers/constants/design-system';
import Mascot from '../../components/ui/mascot';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import {
  // MetaMetricsContextProp,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../shared/constants/metametrics';
import { isFlask, isBeta } from '../../helpers/utils/build-types';
// import { SUPPORT_LINK } from '../../../shared/lib/ui-utils';
import { getCaretCoordinates } from './unlock-page.util';
import ResetPasswordModal from './reset-password-modal';

export default class UnlockPage extends Component {
  static contextTypes = {
    trackEvent: PropTypes.func,
    t: PropTypes.func,
  };

  static propTypes = {
    /**
     * History router for redirect after action
     */
    history: PropTypes.object.isRequired,
    /**
     * Location router for redirect after action
     */
    location: PropTypes.object.isRequired,
    /**
     * If isUnlocked is true will redirect to most recent route in history
     */
    isUnlocked: PropTypes.bool,
    /**
     * onClick handler for "Forgot password?" link
     */
    onRestore: PropTypes.func,
    /**
     * onSubmit handler when form is submitted
     */
    onSubmit: PropTypes.func,
    /**
     * Force update metamask data state
     */
    forceUpdateMetamaskState: PropTypes.func,
  };

  state = {
    password: '',
    error: null,
    showResetPasswordModal: false,
    isLocked: false,
    showPassword: false,
    failedAttempts: 0,
    maxAttempts: 5,
  };

  submitting = false;

  animationEventEmitter = new EventEmitter();

  UNSAFE_componentWillMount() {
    const { isUnlocked, history, location } = this.props;

    if (isUnlocked) {
      // Redirect to the intended route if available, otherwise DEFAULT_ROUTE
      let redirectTo = DEFAULT_ROUTE;
      if (location.state?.from?.pathname) {
        const search = location.state.from.search || '';
        redirectTo = location.state.from.pathname + search;
      }
      history.push(redirectTo);
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { password, failedAttempts, maxAttempts } = this.state;
    const { onSubmit, forceUpdateMetamaskState } = this.props;

    if (password === '' || this.submitting || failedAttempts >= maxAttempts) {
      return;
    }

    this.setState({ error: null });
    this.submitting = true;

    try {
      await onSubmit(password);
      this.context.trackEvent(
        {
          category: MetaMetricsEventCategory.Navigation,
          event: MetaMetricsEventName.AppUnlocked,
          properties: {
            failed_attempts: failedAttempts,
          },
        },
        {
          isNewVisit: true,
        },
      );
    } catch (error) {
      const newFailedAttempts = failedAttempts + 1;
      this.setState({ failedAttempts: newFailedAttempts });

      const errorMessage = error instanceof Error ? error.message : error;

      if (errorMessage === 'Incorrect password') {
        await forceUpdateMetamaskState();
        this.context.trackEvent({
          category: MetaMetricsEventCategory.Navigation,
          event: MetaMetricsEventName.AppUnlockedFailed,
          properties: {
            reason: 'incorrect_password',
            failed_attempts: newFailedAttempts,
          },
        });

        let attemptError;
        const warningMessage = `\n\n${this.context.t('warningMessage')}`;

        if (newFailedAttempts === 1) {
          attemptError = `${this.context.t('attempts')}` + warningMessage;
        } else if (newFailedAttempts < maxAttempts) {
          const attemptsMessage = this.context.t('maxAttempts', [
            maxAttempts - newFailedAttempts,
          ]);
          attemptError = attemptsMessage + warningMessage;
        } else {
          attemptError = this.context.t('maxAttemptsReached');
        }

        this.setState({ error: attemptError });
      } else {
        this.setState({ error: errorMessage });
      }

      this.submitting = false;
    }
  };

  handleInputChange(event) {
    const { target } = event;
    this.setState({ password: target.value, error: null });

    const element = target;
    const boundingRect = element.getBoundingClientRect();
    const coordinates = getCaretCoordinates(element, element.selectionEnd ?? 0);
    this.animationEventEmitter.emit('point', {
      x: boundingRect.left + coordinates.left - element.scrollLeft,
      y: boundingRect.top + coordinates.top - element.scrollTop,
    });
  }

  handlePasswordToggle = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  renderMascot = () => {
    if (isFlask()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="115" height="115" />
      );
    }
    if (isBeta()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="115" height="115" />
      );
    }
    return (
      <Mascot
        animationEventEmitter={this.animationEventEmitter}
        width="170"
        height="170"
      />
    );
  };

  renderHelpText = () => {
    const { error } = this.state;

    if (!error) {
      return null;
    }

    const errorLines = error.split('\n').filter((line) => line.trim() !== '');

    return (
      <Box
        className="unlock-page__help-text"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        gap={1}
      >
        {errorLines.map((line, index) => (
          <Text
            key={index}
            data-testid={`unlock-page-help-text-${index}`}
            variant={TextVariant.bodySm}
            textAlign={TextAlign.Left}
            color={TextColor.errorDefault}
          >
            {line}
          </Text>
        ))}
      </Box>
    );
  };

  onForgotPassword = () => {
    this.setState({ showResetPasswordModal: true });
  };

  onRestoreWallet = () => {
    this.context.trackEvent({
      category: MetaMetricsEventCategory.Accounts,
      event: MetaMetricsEventName.ResetWallet,
    });
    this.props.onRestore();
  };

  render() {
    const { password, error, isLocked, showResetPasswordModal, showPassword } =
      this.state;
    const { t } = this.context;

    return (
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        backgroundColor={BackgroundColor.backgroundDefault}
        width={BlockSize.Full}
        height={BlockSize.Full}
        marginTop={0}
        marginBottom="auto"
        marginInline={0}
        className="unlock-page__container"
      >
        {showResetPasswordModal && (
          <ResetPasswordModal
            onClose={() => this.setState({ showResetPasswordModal: false })}
            onRestore={this.onRestoreWallet}
          />
        )}
        <Box
          as="form"
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          justifyContent={JustifyContent.spaceBetween}
          alignItems={AlignItems.center}
          margin="auto"
          padding={6}
          width={BlockSize.Full}
          height={BlockSize.Full}
          borderRadius={BorderRadius.LG}
          gap={6}
          className="unlock-page"
          data-testid="unlock-page"
          onSubmit={this.handleSubmit}
        >
          <Box
            display={Display.Flex}
            flexDirection={FlexDirection.Column}
            width={BlockSize.Full}
            alignItems={AlignItems.center}
          >
            <img
              src="./images/cryptobridge/logo-3d.png"
              width="308"
              height="240"
            />
            <Text
              data-testid="unlock-page-title"
              as="h1"
              variant={TextVariant.headingLg}
              marginTop={1}
              color={TextColor.textDefault}
            >
              {t('welcomeTitle')}
            </Text>
            <Text
              marginInline={5}
              textAlign={TextAlign.Center}
              as="h3"
              className="welcome-login__description"
              data-testid="onboarding-desc"
              marginBottom={2}
            >
              {t('welcomeDescription')} <br />
              {t('welcomeDescription1')} <br />
              {t('welcomeDescription2')}
            </Text>
            <FormTextField
              id="password"
              type="password"
              label={
                <Box
                  display={Display.Flex}
                  width={BlockSize.Full}
                  justifyContent={JustifyContent.spaceBetween}
                  alignItems={AlignItems.center}
                >
                  <Text variant={TextVariant.bodyMdMedium}>
                    {t('password')}
                  </Text>
                </Box>
              }
              placeholder={t('enterPassword')}
              size={FormTextFieldSize.Lg}
              inputProps={{
                'data-testid': 'unlock-password',
                type: showPassword ? InputType.Text : InputType.Password,
              }}
              onChange={(event) => this.handleInputChange(event)}
              error={Boolean(error)}
              helpText={this.renderHelpText()}
              autoComplete
              autoFocus
              disabled={isLocked}
              width={BlockSize.Full}
              textFieldProps={{
                borderRadius: BorderRadius.LG,
              }}
              endAccessory={
                <ButtonIcon
                  iconName={showPassword ? IconName.EyeSlash : IconName.Eye}
                  data-testid="unlock-password-toggle"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    this.handlePasswordToggle();
                  }}
                  ariaLabel={
                    showPassword
                      ? t('passwordToggleHide')
                      : t('passwordToggleShow')
                  }
                />
              }
            />
          </Box>
          <Box
            display={Display.Flex}
            flexDirection={FlexDirection.Column}
            width={BlockSize.Full}
            alignItems={AlignItems.center}
          >
            <Box
              className="unlock-page__buttons"
              display={Display.Flex}
              flexDirection={FlexDirection.Column}
              width={BlockSize.Full}
              gap={4}
              marginTop={4}
            >
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.Lg}
                block
                type="submit"
                data-testid="unlock-submit"
                disabled={
                  !password ||
                  isLocked ||
                  this.state.failedAttempts >= this.state.maxAttempts
                }
              >
                {this.context.t('unlock')}
              </Button>
              <ButtonLink
                data-testid="unlock-forgot-password-button"
                key="import-account"
                type="button"
                onClick={() => this.onForgotPassword()}
              >
                {t('forgotPassword')}
              </ButtonLink>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
}

import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';
import TextField from '../../ui/text-field';
import { ButtonVariant, Button, Text } from '../../component-library';
import SrpInput from '../srp-input';
import { PASSWORD_MIN_LENGTH } from '../../../helpers/constants/common';
import { useSignOut } from '../../../hooks/identity/useAuthentication';
import { TextColor, TextVariant } from '../../../helpers/constants/design-system';

export default function CreateNewVault({
  disabled = false,
  includeTerms = false,
  onSubmit,
  submitText,
}) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);

  const { signOut } = useSignOut();

  const t = useI18nContext();

  const getPasswordRules = useCallback(() => [
    {
      id: 'length',
      label: t('setPasswordTips1'),
      isValid: false,
      test: (pwd) => pwd.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: 'upper',
      label: t('setPasswordTips2'),
      isValid: false,
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      id: 'lower',
      label: t('setPasswordTips3'),
      isValid: false,
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      id: 'number',
      label: t('setPasswordTips4'),
      isValid: false,
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      id: 'special',
      label: t('setPasswordTips5'),
      isValid: false,
      test: (pwd) => /[@#$!]/.test(pwd),
    },
  ], [t]);

  const [rules, setRules] = useState(getPasswordRules());

  const checkPasswordRules = useCallback(
    (pwd) => {
      return getPasswordRules().map((rule) => ({
        ...rule,
        isValid: rule.test(pwd),
      }));
    },
    [getPasswordRules],
  );

  useEffect(() => {
    setRules(getPasswordRules().map((rule) => ({
      ...rule,
      isValid: rule.test(password),
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const onPasswordChange = useCallback(
    (newPassword) => {
      let newConfirmPasswordError = '';
      let newPasswordError = '';

      if (newPassword && newPassword.length < PASSWORD_MIN_LENGTH) {
        newPasswordError = t('passwordNotLongEnough');
      }

      if (confirmPassword && newPassword !== confirmPassword) {
        newConfirmPasswordError = t('passwordsDontMatch');
      }

      const updatedRules = checkPasswordRules(newPassword);
      setRules(updatedRules);

      setPassword(newPassword);
      setPasswordError(newPasswordError);
      setConfirmPasswordError(newConfirmPasswordError);
    },
    [confirmPassword, t, checkPasswordRules],
  );

  const onConfirmPasswordChange = useCallback(
    (newConfirmPassword) => {
      let newConfirmPasswordError = '';

      if (password !== newConfirmPassword) {
        newConfirmPasswordError = t('passwordsDontMatch');
      }

      setConfirmPassword(newConfirmPassword);
      setConfirmPasswordError(newConfirmPasswordError);
    },
    [password, t],
  );

  const isValid =
    !disabled &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    seedPhrase;

  const onImport = useCallback(
    async (event) => {
      event.preventDefault();

      if (!isValid) {
        return;
      }

      await signOut();
      await onSubmit(password, seedPhrase);
    },
    [isValid, onSubmit, password, seedPhrase, signOut],
  );

  return (
    <form className="create-new-vault__form" onSubmit={onImport}>
      <SrpInput onChange={setSeedPhrase} srpText={t('secretRecoveryPhrase')} />
      <div className="create-new-vault__change-new-password">
        {t('changeNewPassword')}
      </div>
      <div className="create-new-vault__create-password">
        <div className="create-new-vault__create-password-input">
          <TextField
            data-testid="create-vault-password"
            id="password"
            label={t('newPassword')}
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            autoComplete="new-password"
            largeLabel
          />
          <TextField
            data-testid="create-vault-confirm-password"
            id="confirm-password"
            label={t('confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            autoComplete="new-password"
            largeLabel
          />
        </div>
        <div className="create-new-vault__create-password-rules">
          <Text variant={TextVariant.bodyMd} as="div" marginBottom={2}>
            {t('setPasswordTips')}
          </Text>
          <ul className="create-new-vault__rules-list">
            {rules.map((rule) => (
              <li key={rule.id} className="create-new-vault__rule-item">
                <Text
                  variant={TextVariant.inherit}
                  as="span"
                  className={`create-new-vault__rule-icon ${
                    rule.isValid
                      ? 'create-new-vault__rule-icon--valid'
                      : 'create-new-vault__rule-icon--invalid'
                  }`}
                >
                  {rule.isValid ? "•" : "✖"}
                </Text>
                <Text
                  variant={TextVariant.inherit}
                  as="span"
                  className={`create-new-vault__rule-text ${
                    rule.isValid
                      ? 'create-new-vault__rule-text--valid'
                      : 'create-new-vault__rule-text--invalid'
                  }`}
                >
                  {rule.label}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* {includeTerms ? (
        <div className="create-new-vault__terms">
          <Checkbox
            id="create-new-vault-terms-checkbox"
            data-testid="create-new-vault-terms-checkbox"
            isChecked={termsChecked}
            onChange={toggleTermsCheck}
            label={termsOfUse}
          />
        </div>
      ) : null} */}
      <Button
        data-testid="create-new-vault-submit-button"
        className="create-new-vault__submit-button"
        variant={ButtonVariant.Primary}
        disabled={!isValid}
        type="submit"
      >
        {submitText}
      </Button>
    </form>
  );
}

CreateNewVault.propTypes = {
  disabled: PropTypes.bool,
  includeTerms: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
};

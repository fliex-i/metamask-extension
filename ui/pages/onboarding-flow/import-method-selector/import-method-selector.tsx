import React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
  ONBOARDING_IMPORT_WITH_PRIVATE_KEY_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
} from '../../../helpers/constants/routes';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  IconName,
  Text,
  ButtonBase,
  ButtonBaseSize,
  Icon,
  IconSize,
} from '../../../components/component-library';
import {
  AlignItems,
  BlockSize,
  Display,
  FlexDirection,
  JustifyContent,
  TextAlign,
  TextColor,
  TextVariant,
  BorderColor,
  BorderStyle,
  BorderRadius,
  BackgroundColor,
  IconColor,
} from '../../../helpers/constants/design-system';

export default function ImportMethodSelector() {
  const t = useI18nContext();
  const history = useHistory();

  const handleBack = () => {
    history.push(ONBOARDING_WELCOME_ROUTE);
  };

  const handleImportWithSRP = () => {
    history.push(ONBOARDING_IMPORT_WITH_SRP_ROUTE);
  };

  const handleImportWithPrivateKey = () => {
    history.push(ONBOARDING_IMPORT_WITH_PRIVATE_KEY_ROUTE);
  };

  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      alignItems={AlignItems.center}
      height={BlockSize.Full}
      className="import-method-selector"
      data-testid="import-method-selector"
    >
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.spaceBetween}
        width={BlockSize.Full}
        style={{ maxWidth: '480px' }}
      >
        <Box>
          <Box
            marginBottom={4}
            display={Display.Flex}
            alignItems={AlignItems.center}
            justifyContent={JustifyContent.flexStart}
          >
            <ButtonIcon
              iconName={IconName.ArrowLeft}
              color={IconColor.iconDefault}
              size={ButtonIconSize.Md}
              data-testid="import-method-selector-back-button"
              onClick={handleBack}
              ariaLabel={t('back')}
            />
            <Text variant={TextVariant.headingLg} marginLeft={1}>
              {t('importAWallet')}
            </Text>
          </Box>
          {/* <Box textAlign={TextAlign.Left} marginBottom={2}>
            <Text
              variant={TextVariant.bodyMd}
              color={TextColor.textAlternative}
            >
              {t('stepOf', [1, 3])}
            </Text>
          </Box> */}
          {/* <Box textAlign={TextAlign.Left} marginBottom={2}>
            <Text variant={TextVariant.headingLg}>{t('importAWallet')}</Text>
          </Box> */}
          <Box
            display={Display.Flex}
            alignItems={AlignItems.center}
            marginBottom={6}
          >
            <Text
              variant={TextVariant.bodyMd}
              color={TextColor.textAlternative}
            >
              {t('chooseImportMethod')}
            </Text>
          </Box>
          <Box
            display={Display.Flex}
            flexDirection={FlexDirection.Column}
            gap={3}
          >
            {/* Import with Secret Recovery Phrase */}
            <ButtonBase
              data-testid="import-with-srp-option"
              width={BlockSize.Full}
              size={ButtonBaseSize.Lg}
              backgroundColor={BackgroundColor.backgroundDefault}
              borderColor={BorderColor.borderMuted}
              borderStyle={BorderStyle.solid}
              borderWidth={1}
              borderRadius={BorderRadius.MD}
              padding={4}
              onClick={handleImportWithSRP}
              className="import-method-option"
            >
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                justifyContent={JustifyContent.spaceBetween}
                width={BlockSize.Full}
              >
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  gap={3}
                >
                  <Box
                    display={Display.Flex}
                    alignItems={AlignItems.center}
                    justifyContent={JustifyContent.center}
                    style={{ width: '24px', height: '24px' }}
                  >
                    <img
                      src="./images/icons/document-code.svg"
                      alt="Document"
                      width="24"
                      height="24"
                    />
                  </Box>
                  <Text variant={TextVariant.bodyMd}>
                    {t('secretRecoveryPhrase')}
                  </Text>
                </Box>
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  justifyContent={JustifyContent.center}
                >
                  <Icon
                    name={IconName.ArrowRight}
                    size={IconSize.Sm}
                    color={IconColor.iconDefault}
                  />
                </Box>
              </Box>
            </ButtonBase>

            {/* <ButtonBase
              data-testid="import-with-private-key-option"
              width={BlockSize.Full}
              size={ButtonBaseSize.Lg}
              backgroundColor={BackgroundColor.backgroundDefault}
              borderColor={BorderColor.borderMuted}
              borderStyle={BorderStyle.solid}
              borderWidth={1}
              borderRadius={BorderRadius.MD}
              padding={4}
              onClick={handleImportWithPrivateKey}
              className="import-method-option"
            >
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                justifyContent={JustifyContent.spaceBetween}
                width={BlockSize.Full}
              >
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  gap={3}
                >
                  <Box
                    display={Display.Flex}
                    alignItems={AlignItems.center}
                    justifyContent={JustifyContent.center}
                    style={{ width: '24px', height: '24px' }}
                  >
                    <img
                      src="./images/icons/key.svg"
                      alt="Key"
                      width="24"
                      height="24"
                    />
                  </Box>
                  <Text variant={TextVariant.bodyMd}>
                    {t('privateKey')}
                  </Text>
                </Box>
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  justifyContent={JustifyContent.center}
                >
                  <Icon
                    name={IconName.ArrowRight}
                    size={IconSize.Sm}
                    color={IconColor.iconDefault}
                  />
                </Box>
              </Box>
            </ButtonBase> */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

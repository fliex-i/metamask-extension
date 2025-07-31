import React from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import {
  Box,
  Button,
  ButtonVariant,
  ButtonSize,
  Text,
} from '../../../../components/component-library';
import {
  Display,
  FlexDirection,
  JustifyContent,
  AlignItems,
  BlockSize,
  TextVariant,
  TextColor,
  BorderColor,
  BorderRadius,
  BorderStyle,
} from '../../../../helpers/constants/design-system';

export default function PhraseTypeSelector({
  selectedType,
  onTypeSelect,
  secretRecoveryPhrase12,
  secretRecoveryPhrase24,
}) {
  const t = useI18nContext();

  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      gap={4}
      width={BlockSize.Full}
    >
      <Text variant={TextVariant.headingMd} as="h3">
        {t('phraseTypeSelectorTitle')}
      </Text>

      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        gap={3}
        width={BlockSize.Full}
      >
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          alignItems={AlignItems.center}
          justifyContent={JustifyContent.center}
          padding={3}
          borderStyle={BorderStyle.solid}
          borderColor={
            selectedType === '12'
              ? BorderColor.primaryDefault
              : BorderColor.borderMuted
          }
          borderRadius={BorderRadius.MD}
          style={{
            flex: 1,
            cursor: 'pointer',
            backgroundColor: selectedType === '12' ? '#f0f8ff' : 'transparent',
          }}
          onClick={() => onTypeSelect('12')}
        >
          <Text variant={TextVariant.headingSm} style={{ fontSize: '16px' }}>
            {t('phraseType12Words')}
          </Text>
        </Box>

        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          alignItems={AlignItems.center}
          justifyContent={JustifyContent.center}
          padding={3}
          borderStyle={BorderStyle.solid}
          borderColor={
            selectedType === '24'
              ? BorderColor.primaryDefault
              : BorderColor.borderMuted
          }
          borderRadius={BorderRadius.MD}
          style={{
            flex: 1,
            cursor: 'pointer',
            backgroundColor: selectedType === '24' ? '#f0f8ff' : 'transparent',
          }}
          onClick={() => onTypeSelect('24')}
        >
          <Text variant={TextVariant.headingSm} style={{ fontSize: '16px' }}>
            {t('phraseType24Words')}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

PhraseTypeSelector.propTypes = {
  selectedType: PropTypes.oneOf(['12', '24']).isRequired,
  onTypeSelect: PropTypes.func.isRequired,
  secretRecoveryPhrase12: PropTypes.string,
  secretRecoveryPhrase24: PropTypes.string,
};

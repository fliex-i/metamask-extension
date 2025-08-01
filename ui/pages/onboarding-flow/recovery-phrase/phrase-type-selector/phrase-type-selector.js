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
  BorderColor,
  BorderRadius,
  BorderStyle,
  FlexWrap,
  TextAlign,
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
        flexWrap={FlexWrap.Wrap}
        justifyContent={JustifyContent.center}
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
            textAlign: 'center',
            fontSize: '14px',
          }}
          onClick={() => onTypeSelect('12')}
        >
          {t('phraseType12Words')} <br /> {t('phraseType12Words1')}
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
            textAlign: 'center',
            fontSize: '14px',
          }}
          onClick={() => onTypeSelect('24')}
        >
          {t('phraseType24Words')} <br /> {t('phraseType24Words1')}
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

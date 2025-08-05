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
          borderRadius={BorderRadius.MD}
          style={{
            flex: 1,
            cursor: 'pointer',
            backgroundColor:
              selectedType === '12' ? 'rgba(183, 113, 229, 0.10)' : 'white',
            textAlign: 'center',
            fontSize: '14px',
            border:
              selectedType === '12' ? '1px solid #B771E5' : '1px solid #C7C7C7',
            color: selectedType === '12' ? '#B771E5' : '#8F8F8F',
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
          borderRadius={BorderRadius.MD}
          style={{
            flex: 1,
            cursor: 'pointer',
            backgroundColor:
              selectedType === '24' ? 'rgba(183, 113, 229, 0.10)' : 'white',
            textAlign: 'center',
            fontSize: '14px',
            border:
              selectedType === '24' ? '1px solid #B771E5' : '1px solid #C7C7C7',
            color: selectedType === '24' ? '#B771E5' : '#8F8F8F',
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

import React, { useState } from 'react';
import { Box, Text, Modal, ModalOverlay } from '../../component-library';
import { ModalHeader } from '../../component-library/modal-header';
import {
  AlignItems,
  BorderRadius,
  Display,
  FlexDirection,
  JustifyContent,
  TextVariant,
  TextColor,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ModalContent } from '../../component-library/modal-content/deprecated';

export interface SelectionOption {
  name: string;
  value: string;
}

export interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: SelectionOption[];
  selectedOption: string;
  onSelect: (value: string) => void;
  onCancel?: () => void;
  'data-testid'?: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  title,
  options,
  selectedOption,
  onSelect,
  onCancel,
  'data-testid': dataTestId,
}) => {
  const t = useI18nContext();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleOptionClick = (option: SelectionOption) => {
    onSelect(option.value);
    // 移除自动关闭，让父组件控制关闭时机
    // onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        className="multichain-account-menu-popover"
        modalDialogProps={{
          className: 'multichain-account-menu-popover__dialog',
          padding: 0,
          display: Display.Flex,
          flexDirection: FlexDirection.Column,
        }}
      >
        <ModalHeader
          padding={4}
          onClose={onClose}
          onBack={onClose}
        >
          {title}
        </ModalHeader>

        <Box paddingLeft={4} paddingRight={4} paddingBottom={4} paddingTop={4}>
          {/* Options List */}
          <Box marginBottom={4}>
            <Box>
              {options.map((option) => (
                <Box
                  key={option.value}
                  display={Display.Flex}
                  justifyContent={JustifyContent.spaceBetween}
                  alignItems={AlignItems.center}
                  padding={1}
                  onClick={() => handleOptionClick(option)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedOption === option.value
                        ? '#f0f0f0'
                        : hoveredOption === option.value
                        ? '#f8f0ff'
                        : 'transparent',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={() => {
                    if (selectedOption !== option.value) {
                      setHoveredOption(option.value);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredOption(null);
                  }}
                  data-testid={`option-${option.value}`}
                >
                  <Text
                    variant={TextVariant.bodyMd}
                    color={
                      selectedOption === option.value
                        ? TextColor.primaryDefault
                        : hoveredOption === option.value
                        ? TextColor.primaryDefault
                        : TextColor.textDefault
                    }
                    style={{
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {option.name}
                  </Text>
                  {selectedOption === option.value && (
                    <Box
                      as="img"
                      src="./images/icons/check.svg"
                      alt="selected"
                      style={{ width: '20px', height: '20px' }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default SelectionModal;

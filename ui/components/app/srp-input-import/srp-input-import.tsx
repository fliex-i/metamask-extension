import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { wordlist } from '@metamask/scure-bip39/dist/wordlists/english';
import { isValidMnemonic } from '@ethersproject/hdnode';

import {
  Box,
  Button,
  ButtonVariant,
  Text,
  TextField,
  TextFieldType,
} from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  BackgroundColor,
  BorderRadius,
  Display,
  FlexDirection,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { clearClipboard } from '../../../helpers/utils/util';

const SRP_LENGTHS = [12, 24];
const DEFAULT_SRP_LENGTH = 12;

type DraftSrp = {
  word: string;
  id: string;
  active: boolean;
};

type ListOfTextFieldRefs = {
  [wordId: string]: HTMLInputElement;
};

type SuggestionState = {
  visible: boolean;
  position: {
    top: number;
    left: number;
    width: number;
  };
};

type SrpInputImportProps = {
  onChange: (srp: string) => void;
};

const generateMnemonicSuggestions = (input: string) => {
  if (!input || input.length === 0) {
    return [];
  }

  const lowerInput = input.toLowerCase();
  const filteredWords = wordlist.filter((word) => word.startsWith(lowerInput));

  return filteredWords.slice(0, 6).map((word) => ({
    value: word,
    primaryLabel: word,
  }));
};

const SuggestionDropdown = ({
  suggestions,
  onSelect,
  visible,
  position,
}: {
  suggestions: Array<{ value: string; primaryLabel: string }>;
  onSelect: (word: string) => void;
  visible: boolean;
  position: { top: number; left: number; width: number };
}) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="srp-input-import__suggestion-dropdown"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '300px',
        zIndex: 1000,
        maxHeight: '200px',
        overflow: 'auto',
        backgroundColor: 'var(--color-background-default)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        marginTop: '5px',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      <div className="srp-input-import__suggestion-grid">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="srp-input-import__suggestion-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(suggestion.value);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--color-background-default-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Text variant={TextVariant.bodyMd} color={TextColor.textDefault}>
              {suggestion.primaryLabel}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SrpInputImport({ onChange }: SrpInputImportProps) {
  const t = useI18nContext();
  const [draftSrp, setDraftSrp] = useState<DraftSrp[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [misSpelledWords, setMisSpelledWords] = useState<string[]>([]);
  const [srpLength, setSrpLength] = useState(DEFAULT_SRP_LENGTH);
  const [suggestionStates, setSuggestionStates] = useState<SuggestionState[]>(
    [],
  );
  const [focusedWordId, setFocusedWordId] = useState<string | null>(null);

  const srpRefs = useRef<ListOfTextFieldRefs>({});

  const initializeSrp = useCallback(() => {
    const newDraftSrp: DraftSrp[] = Array.from(
      { length: srpLength },
      (_, index) => ({
        word: '',
        id: uuidv4(),
        active: index === 0,
      }),
    );
    setDraftSrp(newDraftSrp);
    setSuggestionStates(
      Array.from({ length: srpLength }, () => ({
        visible: false,
        position: { top: 0, left: 0, width: 0 },
      })),
    );
  }, [srpLength]);

  useEffect(() => {
    initializeSrp();
  }, [srpLength, initializeSrp]);

  const setWordActive = (srp: DraftSrp[], wordId: string) => {
    const newDraftSrp = [...srp];
    newDraftSrp.forEach((word) => {
      word.active = word.id === wordId;
    });
    return newDraftSrp;
  };

  const handleChange = useCallback(
    (id: string, value: string) => {
      const newDraftSrp = [...draftSrp];
      const targetIndex = newDraftSrp.findIndex((word) => word.id === id);
      newDraftSrp[targetIndex] = { ...newDraftSrp[targetIndex], word: value };
      setDraftSrp(setWordActive(newDraftSrp, id));

      if (focusedWordId === id) {
        const suggestions = generateMnemonicSuggestions(value.trim());

        setSuggestionStates((prev) => {
          const newStates = [...prev];
          newStates.forEach((_, index) => {
            newStates[index] = {
              visible: false,
              position: { top: 0, left: 0, width: 0 },
            };
          });
          const wordIndex = newDraftSrp.findIndex((word) => word.id === id);
          newStates[wordIndex] = {
            visible: suggestions.length > 0 && value.trim().length > 0,
            position: { top: 0, left: 0, width: 0 },
          };
          return newStates;
        });
      }
    },
    [draftSrp, focusedWordId],
  );

  const nextWord = useCallback(
    (currentWordId: string) => {
      const currentWordIndex = draftSrp.findIndex(
        (word) => word.id === currentWordId,
      );
      const isLastWord = currentWordIndex === draftSrp.length - 1;

      if (
        (SRP_LENGTHS.includes(draftSrp.length) &&
          isValidMnemonic(draftSrp.map((word) => word.word).join(' '))) ||
        draftSrp.length === srpLength
      ) {
        return;
      }

      if (!isLastWord) {
        setDraftSrp(setWordActive(draftSrp, draftSrp[currentWordIndex + 1].id));

        setSuggestionStates((prev) => {
          const newStates = [...prev];
          newStates.forEach((_, index) => {
            newStates[index] = {
              visible: false,
              position: { top: 0, left: 0, width: 0 },
            };
          });
          return newStates;
        });
      }
    },
    [draftSrp, srpLength],
  );

  const deleteWord = useCallback(
    (wordId: string) => {
      const currentWordIndex = draftSrp.findIndex((word) => word.id === wordId);
      const previousWordId = draftSrp[currentWordIndex - 1]?.id;
      const newDraftSrp = [...draftSrp];
      newDraftSrp.splice(currentWordIndex, 1);

      if (newDraftSrp.length > 0) {
        setDraftSrp(setWordActive(newDraftSrp, previousWordId));
      } else {
        setDraftSrp([]);
      }
    },
    [draftSrp],
  );

  const setWordInactive = useCallback(
    (wordId: string) => {
      const newDraftSrp = [...draftSrp];
      const targetIndex = newDraftSrp.findIndex((word) => word.id === wordId);
      newDraftSrp[targetIndex] = { ...newDraftSrp[targetIndex], active: false };
      setDraftSrp(newDraftSrp);

      setSuggestionStates((prev) => {
        const newStates = [...prev];
        newStates.forEach((_, index) => {
          newStates[index] = {
            visible: false,
            position: { top: 0, left: 0, width: 0 },
          };
        });
        return newStates;
      });
    },
    [draftSrp],
  );

  const onWordFocus = useCallback(
    (wordId: string) => {
      srpRefs.current[wordId].type = 'text';
      const newDraftSrp = [...draftSrp];
      newDraftSrp.forEach((word) => {
        word.active = word.id === wordId;
      });
      setDraftSrp(newDraftSrp);
      setFocusedWordId(wordId);

      const currentWord = newDraftSrp.find((word) => word.id === wordId);
      if (currentWord && currentWord.word.trim().length > 0) {
        const suggestions = generateMnemonicSuggestions(
          currentWord.word.trim(),
        );

        setSuggestionStates((prev) => {
          const newStates = [...prev];
          newStates.forEach((_, index) => {
            newStates[index] = {
              visible: false,
              position: { top: 0, left: 0, width: 0 },
            };
          });
          const wordIndex = newDraftSrp.findIndex((word) => word.id === wordId);
          newStates[wordIndex] = {
            visible: suggestions.length > 0,
            position: { top: 0, left: 0, width: 0 },
          };
          return newStates;
        });
      } else {
        setSuggestionStates((prev) => {
          const newStates = [...prev];
          newStates.forEach((_, index) => {
            newStates[index] = {
              visible: false,
              position: { top: 0, left: 0, width: 0 },
            };
          });
          return newStates;
        });
      }
    },
    [draftSrp],
  );

  const onWordSuggestionSelect = useCallback(
    (selectedWord: string) => {
      if (focusedWordId === null) {
        return;
      }

      const newDraftSrp = [...draftSrp];
      const targetIndex = newDraftSrp.findIndex(
        (word) => word.id === focusedWordId,
      );
      newDraftSrp[targetIndex] = {
        ...newDraftSrp[targetIndex],
        word: selectedWord,
      };
      setDraftSrp(setWordActive(newDraftSrp, focusedWordId));

      setSuggestionStates((prev) => {
        const newStates = [...prev];
        newStates[targetIndex] = {
          visible: false,
          position: { top: 0, left: 0, width: 0 },
        };
        return newStates;
      });

      const currentInput = srpRefs.current[focusedWordId];
      if (currentInput) {
        currentInput.focus();
        currentInput.setSelectionRange(
          selectedWord.length,
          selectedWord.length,
        );
      }
    },
    [draftSrp, focusedWordId],
  );

  // const copySrp = useCallback(async () => {
  //   const srpString = draftSrp.map((word) => word.word).join(' ');
  //   if (srpString.trim()) {
  //     try {
  //       await navigator.clipboard.writeText(srpString);
  //       clearClipboard();
  //     } catch (error) {
  //       console.error('Failed to copy SRP:', error);
  //     }
  //   }
  // }, [draftSrp]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInside = Object.values(srpRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node),
      );

      const isClickInSuggestion = (event.target as Element)?.closest(
        '.srp-input-import__suggestion-dropdown',
      );

      if (!isClickInside && !isClickInSuggestion) {
        setSuggestionStates(
          Array.from({ length: srpLength }, () => ({
            visible: false,
            position: { top: 0, left: 0, width: 0 },
          })),
        );
        setFocusedWordId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [srpLength]);

  useEffect(() => {
    const activeWord = draftSrp.find((word) => word.active);
    if (activeWord) {
      srpRefs.current[activeWord.id]?.focus();
    }

    const wordsNotInWordList = draftSrp
      .filter((word) => word.word !== '' && !wordlist.includes(word.word))
      .map((word) => word.word);
    setMisSpelledWords(wordsNotInWordList);

    if (
      SRP_LENGTHS.includes(draftSrp.length) &&
      !draftSrp.some((word) => word.word.length === 0) &&
      wordsNotInWordList.length === 0
    ) {
      const stringSrp = draftSrp.map((word) => word.word).join(' ');
      onChange(stringSrp);
    } else {
      onChange('');
    }
  }, [draftSrp, onChange]);

  const handleSrpLengthChange = (newLength: number) => {
    setSrpLength(newLength);
    setShowAll(false);
  };

  return (
    <>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        backgroundColor={BackgroundColor.backgroundSection}
        borderRadius={BorderRadius.SM}
        className="srp-input-import__container"
      >
        <Box
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          paddingTop={3}
          paddingLeft={3}
          paddingRight={3}
        >
          <Box display={Display.Flex} gap={2}>
            <Button
              variant={
                srpLength === 12
                  ? ButtonVariant.Primary
                  : ButtonVariant.Secondary
              }
              onClick={() => handleSrpLengthChange(12)}
            >
              {t('phraseType12Words')}
            </Button>
            <Button
              variant={
                srpLength === 24
                  ? ButtonVariant.Primary
                  : ButtonVariant.Secondary
              }
              onClick={() => handleSrpLengthChange(24)}
            >
              {t('phraseType24Words')}
            </Button>
          </Box>
        </Box>

        <Box padding={4} style={{ flex: 1 }}>
          <Box
            display={Display.Grid}
            className="srp-input-import__words-list"
            gap={2}
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {draftSrp.map((word, index) => {
              const suggestions = generateMnemonicSuggestions(word.word);
              const currentState = suggestionStates[index];

              return (
                <Box key={word.id} style={{ position: 'relative' }}>
                  <TextField
                    inputProps={{
                      ref: (el) => {
                        if (el) {
                          srpRefs.current[word.id] = el;
                        }
                      },
                    }}
                    testId={`import-srp__srp-word-${index}`}
                    error={misSpelledWords.includes(word.word)}
                    value={word.word}
                    type={
                      word.active || showAll
                        ? TextFieldType.Text
                        : TextFieldType.Password
                    }
                    startAccessory={
                      <Text
                        color={TextColor.textAlternative}
                        className="srp-input-import__word-index"
                      >
                        {index + 1}
                      </Text>
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(word.id, e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (word.word.trim().length > 0) {
                          nextWord(word.id);
                        }
                      }
                      // if (e.key === 'Backspace' && word.word.length === 0) {
                      //   e.preventDefault();
                      //   deleteWord(word.id);
                      // }
                      if (e.key === 'Tab') {
                        const currentIndex = draftSrp.findIndex(
                          (w) => w.id === word.id,
                        );
                        if (e.shiftKey) {
                          if (currentIndex > 0) {
                            e.preventDefault();
                            const prevWordId = draftSrp[currentIndex - 1].id;
                            const prevInput = srpRefs.current[prevWordId];
                            if (prevInput) {
                              prevInput.focus();
                            }
                          }
                        } else {
                          if (currentIndex < draftSrp.length - 1) {
                            e.preventDefault();
                            const nextWordId = draftSrp[currentIndex + 1].id;
                            const nextInput = srpRefs.current[nextWordId];
                            if (nextInput) {
                              nextInput.focus();
                            }
                          }
                        }
                      }
                    }}
                    onFocus={() => {
                      onWordFocus(word.id);
                    }}
                    onBlur={() => {
                      setWordInactive(word.id);
                    }}
                  />
                  {currentState.visible && (
                    <SuggestionDropdown
                      suggestions={suggestions}
                      onSelect={onWordSuggestionSelect}
                      visible={currentState.visible}
                      position={currentState.position}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box
          display={Display.Grid}
          gap={0}
          className="srp-input-import__actions"
        >
          <Button
            variant={ButtonVariant.Link}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? t('onboardingSrpInputHideAll')
              : t('onboardingSrpInputShowAll')}
          </Button>
          <Button
            variant={ButtonVariant.Link}
            onClick={() => {
              setShowAll(false);
              initializeSrp();
            }}
            style={{
              borderLeft: '1px solid var(--color-border-muted)',
            }}
          >
            {t('onboardingSrpInputClearAll')}
          </Button>
          {/* <Button
            variant={ButtonVariant.Link}
            onClick={copySrp}
            style={{
              borderLeft: '1px solid var(--color-border-muted)',
            }}
          >
            {t('copy')}
          </Button> */}
        </Box>
      </Box>
      {misSpelledWords.length > 0 && (
        <Box marginTop={2}>
          <Text color={TextColor.errorDefault} variant={TextVariant.bodySm}>
            {t('onboardingSrpImportError')}
          </Text>
        </Box>
      )}
    </>
  );
}

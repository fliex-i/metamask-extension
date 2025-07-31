import { isValidMnemonic } from '@ethersproject/hdnode';
import { wordlist } from '@metamask/scure-bip39/dist/wordlists/english';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';
import TextField from '../../ui/text-field';
import { clearClipboard } from '../../../helpers/utils/util';
import { BannerAlert, Text } from '../../component-library';
import ShowHideToggle from '../../ui/show-hide-toggle';
import {
  TextAlign,
  TextVariant,
  Severity,
  TextColor,
} from '../../../helpers/constants/design-system';
import { parseSecretRecoveryPhrase } from './parse-secret-recovery-phrase';

const defaultNumberOfWords = 12;

const hasUpperCase = (draftSrp) => {
  return draftSrp !== draftSrp.toLowerCase();
};

const generateMnemonicSuggestions = (input) => {
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

const SuggestionDropdown = ({ suggestions, onSelect, visible, position }) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="import-srp__suggestion-dropdown"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 1000,
        maxHeight: '200px',
        overflow: 'auto',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      <div className="import-srp__suggestion-grid">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="import-srp__suggestion-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(suggestion.value);
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

export default function SrpInput({ onChange, srpText }) {
  const [srpError, setSrpError] = useState('');
  const [pasteFailed, setPasteFailed] = useState(false);
  const [draftSrp, setDraftSrp] = useState(
    new Array(defaultNumberOfWords).fill(''),
  );
  const [showSrp, setShowSrp] = useState(
    new Array(defaultNumberOfWords).fill(false),
  );
  const [numberOfWords, setNumberOfWords] = useState(defaultNumberOfWords);
  const [suggestionStates, setSuggestionStates] = useState(() =>
    new Array(defaultNumberOfWords)
      .fill(null)
      .map(() => ({ visible: false, position: {} })),
  );
  const [focusedInputIndex, setFocusedInputIndex] = useState(-1);

  const t = useI18nContext();
  const inputRefs = useRef([]);

  const onSrpChange = useCallback(
    (newDraftSrp) => {
      let newSrpError = '';
      const joinedDraftSrp = newDraftSrp.join(' ').trim();

      if (newDraftSrp.some((word) => word !== '')) {
        if (newDraftSrp.some((word) => word === '')) {
          newSrpError = t('seedPhraseReq');
        } else if (hasUpperCase(joinedDraftSrp)) {
          newSrpError = t('invalidSeedPhraseCaseSensitive');
        } else if (!isValidMnemonic(joinedDraftSrp)) {
          newSrpError = t('invalidSeedPhrase');
        }
      }

      setDraftSrp(newDraftSrp);
      setSrpError(newSrpError);
      onChange(newSrpError ? '' : joinedDraftSrp);
    },
    [setDraftSrp, setSrpError, t, onChange],
  );

  const toggleShowSrp = useCallback((index) => {
    setShowSrp((currentShowSrp) => {
      const newShowSrp = currentShowSrp.slice();
      if (newShowSrp[index]) {
        newShowSrp[index] = false;
      } else {
        newShowSrp.fill(false);
        newShowSrp[index] = true;
      }
      return newShowSrp;
    });
  }, []);

  const onSrpWordChange = useCallback(
    (index, newWord) => {
      if (pasteFailed) {
        setPasteFailed(false);
      }
      const newSrp = draftSrp.slice();
      newSrp[index] = newWord.trim();
      onSrpChange(newSrp);

      if (index === focusedInputIndex) {
        const suggestions = generateMnemonicSuggestions(newWord.trim());

        if (suggestions.length > 0 && newWord.trim().length > 0) {
          const inputElement = inputRefs.current[index];
          const rect = inputElement
            ? inputElement.getBoundingClientRect()
            : null;

          setSuggestionStates((prev) => {
            const newStates = [...prev];
            newStates[index] = {
              visible: true,
              position: {
                top: rect ? rect.bottom + 5 : 50,
                left: rect ? rect.left : 0,
                width: rect ? Math.max(rect.width, 300) : 300,
              },
            };
            return newStates;
          });
        } else {
          setSuggestionStates((prev) => {
            const newStates = [...prev];
            newStates[index] = { visible: false, position: {} };
            return newStates;
          });
        }
      }
    },
    [draftSrp, onSrpChange, pasteFailed, focusedInputIndex],
  );

  const onSrpWordSuggestionSelect = useCallback(
    (selectedWord) => {
      if (focusedInputIndex === -1) {
        return;
      }

      const newSrp = draftSrp.slice();
      newSrp[focusedInputIndex] = selectedWord;

      onSrpChange(newSrp);

      setSuggestionStates((prev) => {
        const newStates = [...prev];
        newStates[focusedInputIndex] = { visible: false, position: {} };
        return newStates;
      });

      const nextIndex = focusedInputIndex + 1;
      if (nextIndex < numberOfWords) {
        const nextInput = inputRefs.current[nextIndex];
        if (nextInput) {
          nextInput.focus();
        }
      }
    },
    [draftSrp, onSrpChange, numberOfWords, focusedInputIndex],
  );

  const onSrpPaste = useCallback(
    (rawSrp) => {
      const parsedSrp = parseSecretRecoveryPhrase(rawSrp);
      let newDraftSrp = parsedSrp.split(' ');

      if (newDraftSrp.length > 24) {
        setPasteFailed(true);
        return;
      } else if (pasteFailed) {
        setPasteFailed(false);
      }

      let newNumberOfWords = numberOfWords;
      if (newDraftSrp.length !== numberOfWords) {
        if (newDraftSrp.length < 12) {
          newNumberOfWords = 12;
        } else if (newDraftSrp.length % 3 === 0) {
          newNumberOfWords = newDraftSrp.length;
        } else {
          newNumberOfWords =
            newDraftSrp.length + (3 - (newDraftSrp.length % 3));
        }
        setNumberOfWords(newNumberOfWords);
      }

      if (newDraftSrp.length < newNumberOfWords) {
        newDraftSrp = newDraftSrp.concat(
          new Array(newNumberOfWords - newDraftSrp.length).fill(''),
        );
      }
      setShowSrp(new Array(newNumberOfWords).fill(false));
      setSuggestionStates(
        new Array(newNumberOfWords)
          .fill(null)
          .map(() => ({ visible: false, position: {} })),
      );
      setFocusedInputIndex(-1);
      onSrpChange(newDraftSrp);
      clearClipboard();
    },
    [numberOfWords, onSrpChange, pasteFailed, setPasteFailed],
  );

  const numberOfWordsOptions = [];
  for (let i = 12; i <= 24; i += 3) {
    numberOfWordsOptions.push({
      name: t('srpInputNumberOfWords', [`${i}`]),
      value: `${i}`,
    });
  }

  const handleNumberOfWordsChange = useCallback(
    (newSelectedOption) => {
      const newNumberOfWords = parseInt(newSelectedOption, 10);
      if (Number.isNaN(newNumberOfWords)) {
        throw new Error('Unable to parse option as integer');
      }

      let newDraftSrp = draftSrp.slice(0, newNumberOfWords);
      if (newDraftSrp.length < newNumberOfWords) {
        newDraftSrp = newDraftSrp.concat(
          new Array(newNumberOfWords - newDraftSrp.length).fill(''),
        );
      }
      setNumberOfWords(newNumberOfWords);
      setShowSrp(new Array(newNumberOfWords).fill(false));
      setSuggestionStates(
        new Array(newNumberOfWords)
          .fill(null)
          .map(() => ({ visible: false, position: {} })),
      );
      setFocusedInputIndex(-1);
      onSrpChange(newDraftSrp);
    },
    [draftSrp, onSrpChange],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = inputRefs.current.some(
        (ref) => ref && ref.contains(event.target),
      );

      const isClickInSuggestion = event.target.closest(
        '.import-srp__suggestion-dropdown',
      );

      if (!isClickInside && !isClickInSuggestion) {
        setSuggestionStates(
          new Array(numberOfWords)
            .fill(null)
            .map(() => ({ visible: false, position: {} })),
        );
        setFocusedInputIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [numberOfWords]);

  return (
    <div className="import-srp__container">
      <div className="import-srp__dropdown-container">
        <label className="import-srp__srp-label">
          {srpText && (
            <Text
              align={TextAlign.Left}
              variant={TextVariant.headingSm}
              as="h4"
            >
              {srpText}
            </Text>
          )}
        </label>
        {/* <BannerAlert
          className="import-srp__paste-tip"
          severity={Severity.Info}
          description={t('srpPasteTip')}
          descriptionProps={{ className: 'import-srp__banner-alert-text' }}
        /> */}
        {/* <Dropdown
          className="import-srp__number-of-words-dropdown"
          onChange={handleNumberOfWordsChange}
          options={numberOfWordsOptions}
          selectedOption={`${numberOfWords}`}
        /> */}
      </div>
      <div className="import-srp__srp">
        {[...Array(numberOfWords).keys()].map((index) => {
          const id = `import-srp__srp-word-${index}`;
          const suggestions = generateMnemonicSuggestions(draftSrp[index]);
          const currentState = suggestionStates[index];

          return (
            <div key={index} className="import-srp__srp-word">
              <label htmlFor={id} className="import-srp__srp-word-label">
                <Text>{`${index + 1}.`}</Text>
              </label>
              <div className="import-srp__srp-word-input-container">
                <div
                  className="import-srp__srp-word-input-wrapper"
                  style={{ position: 'relative', flex: 1 }}
                >
                  <TextField
                    id={id}
                    data-testid={id}
                    type={showSrp[index] ? 'text' : 'password'}
                    onChange={(e) => {
                      e.preventDefault();
                      onSrpWordChange(index, e.target.value);
                    }}
                    onFocus={() => {
                      setFocusedInputIndex(index);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (focusedInputIndex === index) {
                          setFocusedInputIndex(-1);
                        }
                      }, 100);
                    }}
                    value={draftSrp[index]}
                    autoComplete="off"
                    onPaste={(event) => {
                      const newSrp = event.clipboardData.getData('text');

                      if (newSrp.trim().match(/\s/u)) {
                        event.preventDefault();
                        onSrpPaste(newSrp);
                      }
                    }}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                  />
                  <SuggestionDropdown
                    suggestions={suggestions}
                    onSelect={(word) => onSrpWordSuggestionSelect(word)}
                    visible={suggestionStates[index].visible}
                    position={suggestionStates[index].position}
                  />
                </div>
                <ShowHideToggle
                  id={`${id}-checkbox`}
                  ariaLabelHidden={t('srpWordHidden')}
                  ariaLabelShown={t('srpWordShown')}
                  shown={showSrp[index]}
                  data-testid={`${id}-checkbox`}
                  onChange={() => toggleShowSrp(index)}
                  title={t('srpToggleShow')}
                />
              </div>
            </div>
          );
        })}
      </div>
      {srpError ? (
        <BannerAlert
          className="import-srp__srp-error"
          severity={Severity.Danger}
          description={srpError}
          descriptionProps={{ className: 'import-srp__banner-alert-text' }}
        />
      ) : null}
      {pasteFailed ? (
        <BannerAlert
          className="import-srp__srp-too-many-words-error"
          severity={Severity.Danger}
          actionButtonLabel={t('dismiss')}
          actionButtonOnClick={() => setPasteFailed(false)}
          description={t('srpPasteFailedTooManyWords')}
          descriptionProps={{ className: 'import-srp__banner-alert-text' }}
        />
      ) : null}
    </div>
  );
}

SrpInput.propTypes = {
  /**
   * Event handler for SRP changes.
   *
   * This is only called with a valid, well-formated (i.e. exactly one space
   * between each word) SRP or with an empty string.
   *
   * This is called each time the draft SRP is updated. If the draft SRP is
   * valid, this is called with a well-formatted version of that draft SRP.
   * Otherwise, this is called with an empty string.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Text to show on the left of the Dropdown component. Wrapped in Typography component.
   */
  srpText: PropTypes.string.isRequired,
};

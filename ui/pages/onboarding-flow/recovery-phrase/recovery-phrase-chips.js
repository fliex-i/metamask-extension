import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  ButtonBase,
  ButtonVariant,
  Text,
  TextField,
} from '../../../components/component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  TextVariant,
  Display,
  TextColor,
  FontWeight,
  FlexDirection,
  BlockSize,
  BorderRadius,
  JustifyContent,
  AlignItems,
  BackgroundColor,
} from '../../../helpers/constants/design-system';

export default function RecoveryPhraseChips({
  secretRecoveryPhrase,
  confirmPhase,
  quizWords = [],
  setInputValue,
}) {
  const t = useI18nContext();

  const quizOptions = useMemo(() => {
    if (!quizWords.length) {
      return [];
    }
    return quizWords.map((quizWord) => {
      const correctWord = secretRecoveryPhrase[quizWord.index];
      const otherWords = secretRecoveryPhrase.filter(
        (w, idx) => idx !== quizWord.index,
      );
      const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
      const distractors = shuffled.slice(0, 2);
      const options = [correctWord, ...distractors].sort(
        () => Math.random() - 0.5,
      );
      return {
        index: quizWord.index,
        options,
        correct: correctWord,
      };
    });
  }, [quizWords, secretRecoveryPhrase]);

  const [userSelections, setUserSelections] = useState(
    Array(quizWords.length).fill(''),
  );

  const quizAnswers = useMemo(
    () =>
      quizWords.map((quizWord, idx) => ({
        index: quizWord.index,
        word: userSelections[idx] || '',
      })),
    [quizWords, userSelections],
  );

  const allQuizCorrect = useMemo(() => {
    if (confirmPhase && quizWords.length === 3) {
      return quizOptions.every(
        (group, idx) => userSelections[idx] === group.correct,
      );
    }
    return false;
  }, [confirmPhase, quizWords, quizOptions, userSelections]);

  const phrasesToDisplay = secretRecoveryPhrase;
  const indicesToCheck = useMemo(
    () => quizWords.map((word) => word.index),
    [quizWords],
  );
  const [legacyQuizAnswers, setLegacyQuizAnswers] = useState(
    indicesToCheck.map((index) => ({
      index, // the index in the SRP chips UI where the answer is inserted
      word: '', // the answer value
      actualIndexInSrp: -1, // the correct index of the answer value in the secret recovery phrase
    })),
  );

  const allLegacyCorrect = useMemo(() => {
    if (!confirmPhase && quizWords.length === 3) {
      return legacyQuizAnswers.every(
        (answer) =>
          answer.word && secretRecoveryPhrase[answer.index] === answer.word,
      );
    }
    return false;
  }, [confirmPhase, quizWords, legacyQuizAnswers, secretRecoveryPhrase]);

  useEffect(() => {
    if (confirmPhase && quizWords.length === 3) {
      setInputValue?.(quizAnswers, allQuizCorrect);
    } else if (typeof setInputValue === 'function') {
      setInputValue(true);
    }
  }, [
    quizAnswers,
    allQuizCorrect,
    setInputValue,
    confirmPhase,
    quizWords.length,
  ]);

  useEffect(() => {
    setUserSelections(Array(quizWords.length).fill(''));
  }, [quizWords]);

  const setNextTargetIndex = (newQuizAnswers) => {
    const emptyAnswers = newQuizAnswers.reduce((acc, answer) => {
      if (answer.word === '') {
        acc.push(answer.index);
      }
      return acc;
    }, []);
    const firstEmpty = emptyAnswers.length ? Math.min(...emptyAnswers) : -1;

    return firstEmpty;
  };
  const [indexToFocus, setIndexToFocus] = useState(
    setNextTargetIndex(legacyQuizAnswers),
  );

  const addQuizWord = useCallback(
    (word, actualIndexInSrp) => {
      const newQuizAnswers = [...legacyQuizAnswers];
      const targetIndex = newQuizAnswers.findIndex(
        (answer) => answer.index === indexToFocus,
      );
      newQuizAnswers[targetIndex] = {
        index: indexToFocus,
        word,
        actualIndexInSrp,
      };
      setLegacyQuizAnswers(newQuizAnswers);
      setIndexToFocus(setNextTargetIndex(newQuizAnswers));
    },
    [legacyQuizAnswers, indexToFocus],
  );

  const removeQuizWord = useCallback(
    (answerWord) => {
      const newQuizAnswers = [...legacyQuizAnswers];
      const targetIndex = newQuizAnswers.findIndex(
        (answer) => answer.word === answerWord,
      );
      newQuizAnswers[targetIndex] = {
        ...newQuizAnswers[targetIndex],
        word: '',
        actualIndexInSrp: -1,
      };

      setLegacyQuizAnswers(newQuizAnswers);
      setIndexToFocus(setNextTargetIndex(newQuizAnswers));
    },
    [legacyQuizAnswers],
  );

  useEffect(() => {
    if (quizWords.length) {
      const newQuizAnswers = quizWords.map((word) => ({
        index: word.index,
        word: '',
        actualIndexInSrp: -1,
      }));
      setLegacyQuizAnswers(newQuizAnswers);
      setIndexToFocus(setNextTargetIndex(newQuizAnswers));
    }
  }, [quizWords]);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <Box display={Display.Flex} flexDirection={FlexDirection.Column} gap={4}>
      <Box
        padding={4}
        borderRadius={BorderRadius.LG}
        display={Display.Grid}
        width={BlockSize.Full}
        backgroundColor={BackgroundColor.backgroundSection}
        className="recovery-phrase__secret"
      >
        <Box
          display={Display.Grid}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
          gap={2}
          data-testid="recovery-phrase-chips"
          data-recovery-phrase={secretRecoveryPhrase.join(':')}
          data-quiz-words={JSON.stringify(quizWords)}
          className={classnames('recovery-phrase__chips')}
        >
          {phrasesToDisplay.map((word, index) => {
            const isQuizWord = indicesToCheck.includes(index);
            const wordToDisplay = isQuizWord
              ? legacyQuizAnswers.find((answer) => answer.index === index)
                  ?.word || ''
              : word;
            return (
              <TextField
                testId={
                  confirmPhase && isQuizWord
                    ? `recovery-phrase-input-${index}`
                    : `recovery-phrase-chip-${index}`
                }
                key={index}
                value={wordToDisplay}
                className={classnames({
                  'mm-text-field--target-index': index === indexToFocus,
                  'mm-text-field--quiz-word': isQuizWord,
                  'mm-text-field--blurred': hoveredIndex !== index,
                })}
                startAccessory={
                  <Text
                    color={TextColor.textAlternative}
                    className="recovery-phrase__word-index"
                  >
                    {index + 1}.
                  </Text>
                }
                type={confirmPhase && !isQuizWord ? 'password' : 'text'}
                readOnly
                disabled={confirmPhase && !isQuizWord}
                onClick={() => {
                  if (!confirmPhase) {
                    return;
                  }
                  if (wordToDisplay === '') {
                    setIndexToFocus(index);
                  } else {
                    removeQuizWord(wordToDisplay);
                  }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </Box>
      </Box>
      {quizWords.length === 3 && (
        <Box display={Display.Flex} gap={2} width={BlockSize.Full}>
          {quizWords.map((quizWord) => {
            const actualIdxInSrp = quizWord.index;
            // check if the quiz word has been added to the quizAnswers array
            // here we are checking the answer's actual index in the secret recovery phrase
            // to handle the case where the quiz words has the same value but different indexes
            // e.g. the quiz words are ["one", "two", "one"]
            const isAnswered = legacyQuizAnswers.some(
              (answer) => answer.actualIndexInSrp === actualIdxInSrp,
            );
            return isAnswered ? (
              <ButtonBase
                data-testid={`recovery-phrase-quiz-answered-${actualIdxInSrp}`}
                key={quizWord.index}
                color={TextColor.textAlternative}
                borderRadius={BorderRadius.LG}
                block
                onClick={() => {
                  removeQuizWord(quizWord.word);
                }}
              >
                {secretRecoveryPhrase[actualIdxInSrp]}
              </ButtonBase>
            ) : (
              <Button
                data-testid={`recovery-phrase-quiz-unanswered-${actualIdxInSrp}`}
                key={quizWord.index}
                variant={ButtonVariant.Secondary}
                borderRadius={BorderRadius.LG}
                block
                onClick={() => {
                  addQuizWord(quizWord.word, actualIdxInSrp);
                }}
              >
                {secretRecoveryPhrase[actualIdxInSrp]}
              </Button>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

RecoveryPhraseChips.propTypes = {
  secretRecoveryPhrase: PropTypes.array,
  phraseRevealed: PropTypes.bool,
  revealPhrase: PropTypes.func,
  confirmPhase: PropTypes.bool,
  quizWords: PropTypes.array,
  setInputValue: PropTypes.func,
};

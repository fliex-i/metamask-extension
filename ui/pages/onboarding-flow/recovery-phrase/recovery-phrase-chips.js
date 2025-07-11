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
    if (!quizWords.length) return [];
    return quizWords.map((quizWord) => {
      const correctWord = secretRecoveryPhrase[quizWord.index];
      const otherWords = secretRecoveryPhrase.filter(
        (_, idx) => idx !== quizWord.index,
      );
      const distractors = otherWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
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

  const [userSelections, setUserSelections] = useState([]);

  useEffect(() => {
    setUserSelections(Array(quizWords.length).fill(''));
  }, [quizWords]);

  const quizAnswers = useMemo(
    () =>
      quizWords.map((word, idx) => ({
        index: word.index,
        word: userSelections[idx] || '',
      })),
    [quizWords, userSelections],
  );

  const allQuizCorrect = useMemo(
    () =>
      confirmPhase &&
      quizWords.length === 3 &&
      quizOptions.every((group, idx) => userSelections[idx] === group.correct),
    [confirmPhase, quizWords, quizOptions, userSelections],
  );

  useEffect(() => {
    if (typeof setInputValue === 'function') {
      setInputValue(
        confirmPhase && quizWords.length === 3 ? quizAnswers : true,
        allQuizCorrect,
      );
    }
  }, [
    quizAnswers,
    allQuizCorrect,
    setInputValue,
    confirmPhase,
    quizWords.length,
  ]);

  const phrasesToDisplay = secretRecoveryPhrase;
  const indicesToCheck = useMemo(
    () => quizWords.map((word) => word.index),
    [quizWords],
  );

  const [legacyQuizAnswers, setLegacyQuizAnswers] = useState([]);
  const [indexToFocus, setIndexToFocus] = useState(-1);

  useEffect(() => {
    const initialAnswers = quizWords.map((word) => ({
      index: word.index,
      word: '',
      actualIndexInSrp: -1,
    }));
    setLegacyQuizAnswers(initialAnswers);
    setIndexToFocus(setNextTargetIndex(initialAnswers));
  }, [quizWords]);

  const setNextTargetIndex = (answers) => {
    const empty = answers.filter((a) => !a.word).map((a) => a.index);
    return empty.length ? Math.min(...empty) : -1;
  };

  const addQuizWord = useCallback(
    (word, actualIndexInSrp) => {
      const newAnswers = [...legacyQuizAnswers];
      const targetIdx = newAnswers.findIndex((a) => a.index === indexToFocus);
      newAnswers[targetIdx] = {
        index: indexToFocus,
        word,
        actualIndexInSrp,
      };
      setLegacyQuizAnswers(newAnswers);
      setIndexToFocus(setNextTargetIndex(newAnswers));
    },
    [legacyQuizAnswers, indexToFocus],
  );

  const removeQuizWord = useCallback(
    (word) => {
      const newAnswers = legacyQuizAnswers.map((a) =>
        a.word === word ? { ...a, word: '', actualIndexInSrp: -1 } : a,
      );
      setLegacyQuizAnswers(newAnswers);
      setIndexToFocus(setNextTargetIndex(newAnswers));
    },
    [legacyQuizAnswers],
  );

  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (confirmPhase && quizWords.length === 3) {
    return (
      <Box display={Display.Flex} flexDirection={FlexDirection.Column} gap={4}>
        {quizOptions.map((group, groupIdx) => {
          const isCorrect = userSelections[groupIdx] === group.correct;
          return (
            <Box key={group.index}>
              <Text
                variant={TextVariant.bodyMd}
                fontWeight={FontWeight.Medium}
                marginBottom={2}
              >
                {`${t('word')} #${group.index + 1}`}
              </Text>
              <Box display={Display.Flex} gap={2}>
                {group.options.map((option) => {
                  const selected = userSelections[groupIdx] === option;
                  const canClick = !isCorrect || selected;
                  return (
                    <ButtonBase
                      key={option}
                      className={classnames('recovery-phrase-quiz-option', {
                        'recovery-phrase-quiz-option--selected': selected,
                      })}
                      style={{
                        border: selected
                          ? '2px solid var(--brand-colors-purple)'
                          : '1px solid #d6d9dc',
                        background: '#fff',
                        minWidth: 120,
                        minHeight: 40,
                        fontWeight: selected ? 600 : 400,
                        opacity: !canClick ? 0.5 : 1,
                        cursor: 'pointer',
                      }}
                      disabled={!canClick}
                      onClick={() => {
                        if (!canClick) return;
                        const selections = [...userSelections];
                        selections[groupIdx] = selected ? '' : option;
                        setUserSelections(selections);
                      }}
                    >
                      {option}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

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
            const isQuiz = indicesToCheck.includes(index);
            const value = isQuiz
              ? legacyQuizAnswers.find((a) => a.index === index)?.word || ''
              : word;
            return (
              <TextField
                testId={
                  confirmPhase && isQuiz
                    ? `recovery-phrase-input-${index}`
                    : `recovery-phrase-chip-${index}`
                }
                key={index}
                value={value}
                className={classnames({
                  'mm-text-field--target-index': index === indexToFocus,
                  'mm-text-field--quiz-word': isQuiz,
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
                type={confirmPhase && !isQuiz ? 'password' : 'text'}
                readOnly
                disabled={confirmPhase && !isQuiz}
                onClick={() => {
                  if (!confirmPhase) return;
                  value === '' ? setIndexToFocus(index) : removeQuizWord(value);
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
            const actualIdx = quizWord.index;
            const isAnswered = legacyQuizAnswers.some(
              (a) => a.actualIndexInSrp === actualIdx,
            );
            const phrase = secretRecoveryPhrase[actualIdx];
            return isAnswered ? (
              <ButtonBase
                data-testid={`recovery-phrase-quiz-answered-${actualIdx}`}
                key={quizWord.index}
                color={TextColor.textAlternative}
                borderRadius={BorderRadius.LG}
                block
                onClick={() => removeQuizWord(quizWord.word)}
              >
                {phrase}
              </ButtonBase>
            ) : (
              <Button
                data-testid={`recovery-phrase-quiz-unanswered-${actualIdx}`}
                key={quizWord.index}
                variant={ButtonVariant.Secondary}
                borderRadius={BorderRadius.LG}
                block
                onClick={() => addQuizWord(quizWord.word, actualIdx)}
              >
                {phrase}
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

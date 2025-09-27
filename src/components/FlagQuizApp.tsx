'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Ruby from './Ruby';
import Confetti from './Confetti';
import SelectingView from './SelectingView';
import GameView from './GameView';
import ResultsView from './ResultsView';
import { Country, Difficulty, GameState, ErrorCode } from './types';

// --- 主要国リスト ---
const easyCountries = [
  'China',
  'India',
  'United States',
  'Indonesia',
  'Pakistan',
  'Nigeria',
  'Brazil',
  'Bangladesh',
  'Russia',
  'Mexico',
  'Japan',
  'Ethiopia',
  'Philippines',
  'Egypt',
  'Vietnam',
  'DR Congo',
  'Turkey',
  'Iran',
  'Germany',
  'Thailand',
  'United Kingdom',
  'France',
  'Italy',
  'Tanzania',
  'South Africa',
  'Myanmar',
  'Kenya',
  'South Korea',
  'Colombia',
  'Spain',
  'Uganda',
  'Argentina',
  'Algeria',
  'Sudan',
  'Ukraine',
  'Iraq',
  'Afghanistan',
  'Poland',
  'Canada',
  'Morocco',
  'Saudi Arabia',
  'Uzbekistan',
  'Peru',
  'Angola',
  'Malaysia',
  'Mozambique',
  'Ghana',
  'Yemen',
  'Nepal',
  'Venezuela',
];

const normalCountries = [
  ...easyCountries,
  'Ivory Coast',
  'Madagascar',
  'Cameroon',
  'North Korea',
  'Australia',
  'Niger',
  'Sri Lanka',
  'Burkina Faso',
  'Mali',
  'Romania',
  'Malawi',
  'Chile',
  'Kazakhstan',
  'Zambia',
  'Guatemala',
  'Ecuador',
  'Syria',
  'Netherlands',
  'Senegal',
  'Cambodia',
  'Chad',
  'Somalia',
  'Zimbabwe',
  'Guinea',
  'Rwanda',
  'Benin',
  'Burundi',
  'Tunisia',
  'Bolivia',
  'Belgium',
  'Haiti',
  'Cuba',
  'South Sudan',
  'Dominican Republic',
  'Czech Republic',
  'Greece',
  'Jordan',
  'Portugal',
  'Azerbaijan',
  'Sweden',
  'Honduras',
  'United Arab Emirates',
  'Hungary',
  'Tajikistan',
  'Belarus',
  'Austria',
  'Papua New Guinea',
  'Serbia',
  'Israel',
  'Switzerland',
];

const FlagQuizApp: React.FC = () => {
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [quizCountries, setQuizCountries] = useState<Country[]>([]);
  const [remainingCountries, setRemainingCountries] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>('loading');
  const [errorCode, setErrorCode] = useState<ErrorCode>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | 'all' | null>(
    null
  );

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,translations,flags'
        );
        if (!response.ok) throw new Error('API fetch failed');
        let data: Country[] = await response.json();
        const filteredData = data.filter(
          (c) => c.translations.jpn?.common && c.flags.svg && c.name.common
        );
        setAllCountries(filteredData);
        setGameState('selecting');
      } catch (err) {
        setErrorCode('FETCH');
        setGameState('error');
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };
    fetchCountries();
  }, []);

  // load persisted scores from localStorage once on mount
  useEffect(() => {
    try {
      const keyLast = 'flag-quiz-last-score';
      const keyBest = 'flag-quiz-best-score';
      const rawLast = localStorage.getItem(keyLast);
      const rawBest = localStorage.getItem(keyBest);
      setLastScore(rawLast !== null ? Number(rawLast) : null);
      setBestScore(rawBest !== null ? Number(rawBest) : null);
    } catch (e) {
      // ignore storage errors (e.g., SSR or blocked storage)
    }
  }, []);

  const setupQuestion = useCallback(() => {
    // need at least one remaining correct country and at least 4 options available overall
    if (remainingCountries.length < 1 || quizCountries.length < 4) {
      setErrorCode('SETUP');
      setGameState('error');
      return;
    }

    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowConfetti(false);

    // take next correct country from remainingCountries (guarantees no duplicate corrects)
    const [nextCorrect, ...rest] = remainingCountries;
    setRemainingCountries(rest);

    // pick 3 distractors from quizCountries excluding the correct one
    const pool = quizCountries.filter(
      (c) => c.name.common !== nextCorrect.name.common
    );
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const distractors = shuffledPool.slice(0, 3);

    const choiceNames = [
      nextCorrect.translations.jpn.common,
      ...distractors.map((c) => c.translations.jpn.common),
    ];
    const shuffledOptions = [...choiceNames].sort(() => 0.5 - Math.random());

    setCurrentCountry(nextCorrect);
    setOptions(shuffledOptions);
    setQuestionCount((prev) => prev + 1);
  }, [remainingCountries, quizCountries]);

  const startGame = (num?: number | 'all') => {
    if (!difficulty) return;
    let filtered: Country[] = [];

    // choose pool based on difficulty
    if (difficulty === 'level0') {
      filtered = allCountries.filter((c) =>
        easyCountries.includes(c.name.common)
      );
    } else if (difficulty === 'easy') {
      filtered = allCountries.filter((c) =>
        easyCountries.includes(c.name.common)
      );
    } else if (difficulty === 'normal') {
      filtered = allCountries.filter((c) =>
        normalCountries.includes(c.name.common)
      );
    } else if (difficulty === 'hard') {
      filtered = allCountries;
    } else {
      // superhard or fallback
      filtered = allCountries;
    }

    if (filtered.length < 4) {
      setErrorCode('SETUP');
      setGameState('error');
      return;
    }

    // determine count (default based on difficulty if num not passed)
    let count: number | 'all' | undefined = num;
    if (typeof count === 'undefined') {
      if (difficulty === 'level0') count = 20;
      else if (difficulty === 'easy') count = 30;
      else if (difficulty === 'normal') count = 50;
      else if (difficulty === 'hard') count = 100;
      else count = 'all';
    }

    // if numeric, sample that many countries from filtered
    if (typeof count === 'number' && filtered.length > count) {
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      filtered = shuffled.slice(0, count);
    }

    setQuizCountries(filtered);
    // initialize remainingCountries as a shuffled copy of filtered so we can pop unique correct answers
    const remaining = [...filtered].sort(() => 0.5 - Math.random());
    setRemainingCountries(remaining);
    setTotalQuestions(count ?? 'all');
    setScore(0);
    setQuestionCount(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing' && questionCount === 0) setupQuestion();
  }, [gameState, questionCount, setupQuestion]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentCountry) return;
    setIsAnswered(true);
    if (selectedAnswer === currentCountry.translations.jpn.common) {
      setScore((prev) => prev + 1);
      setShowConfetti(true);
    }
  };

  const handleNextQuestion = () => {
    if (typeof totalQuestions === 'number' && questionCount >= totalQuestions)
      setGameState('results');
    else setupQuestion();
  };

  // persist last and best score when entering results
  useEffect(() => {
    if (gameState === 'results') {
      try {
        const keyLast = 'flag-quiz-last-score';
        const keyBest = 'flag-quiz-best-score';
        const prevBestRaw = localStorage.getItem(keyBest);
        const prevBest = prevBestRaw ? Number(prevBestRaw) : null;
        localStorage.setItem(keyLast, String(score));
        setLastScore(score);
        if (prevBest === null || score > prevBest) {
          localStorage.setItem(keyBest, String(score));
          setBestScore(score);
        } else {
          setBestScore(prevBest);
        }
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [gameState, score]);

  const handlePlayAgain = () => {
    setScore(0);
    setQuestionCount(0);
    setGameState('playing');
  };

  const handleReturnToStart = () => {
    setGameState('selecting');
    setDifficulty(null);
    setTotalQuestions(null);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered)
      return selectedAnswer === option
        ? 'bg-yellow-300 transform scale-105'
        : 'bg-white hover:bg-yellow-100';
    const isCorrect = option === currentCountry?.translations.jpn.common;
    if (isCorrect)
      return 'bg-green-400 text-white transform scale-105 animate-pulse';
    if (selectedAnswer === option && !isCorrect) return 'bg-red-400 text-white';
    return 'bg-gray-200 text-gray-500';
  };

  if (gameState === 'loading')
    return (
      <div className='flex items-center justify-center min-h-screen bg-blue-50'>
        <p className='text-2xl font-bold text-blue-600'>
          いま、せかいの<Ruby rt='こっき'>国旗</Ruby>をあつめているよ！
        </p>
      </div>
    );

  if (gameState === 'error')
    return (
      <div className='flex items-center justify-center min-h-screen bg-red-50'>
        <div className='text-xl font-bold text-red-600 text-center leading-relaxed p-4'>
          {errorCode === 'FETCH' && (
            <p>
              <Ruby rt='くに'>国</Ruby>のデータの<Ruby rt='よ'>読</Ruby>み
              <Ruby rt='こ'>込</Ruby>みに<Ruby rt='しっぱい'>失敗</Ruby>
              しました。
              <br />
              ページを<Ruby rt='こうしん'>更新</Ruby>してみてください。
            </p>
          )}
          {errorCode === 'SETUP' && (
            <p>
              クイズを<Ruby rt='さくせい'>作成</Ruby>するのに
              <Ruby rt='じゅうぶん'>十分</Ruby>な<Ruby rt='くに'>国</Ruby>
              データがありません。
            </p>
          )}
        </div>
      </div>
    );

  if (gameState === 'selecting') {
    return (
      <SelectingView
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        startGame={startGame}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <ResultsView
        score={score}
        questionCount={questionCount}
        totalQuestions={totalQuestions}
        showConfetti={showConfetti}
        onPlayAgain={handlePlayAgain}
        onReturn={handleReturnToStart}
        bestScore={bestScore}
      />
    );
  }

  if (gameState === 'playing' && !currentCountry) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-blue-50'>
        <p className='text-2xl font-bold text-blue-600'>
          もんだいをつくってるよ！
        </p>
      </div>
    );
  }

  return (
    <>
      {/* persistent score header (always visible) */}
      <div className='fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md text-sm flex gap-4 items-center'>
        <div className='text-gray-600'>
          前回:{' '}
          <span className='font-semibold text-gray-800'>
            {lastScore ?? '-'}
          </span>
        </div>
        <div className='text-gray-600'>
          最高:{' '}
          <span className='font-semibold text-gray-800'>
            {bestScore ?? '-'}
          </span>
        </div>
      </div>
      {showConfetti && <Confetti />}
      {currentCountry && (
        <GameView
          currentCountry={currentCountry}
          options={options}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          questionCount={questionCount}
          totalQuestions={totalQuestions}
          score={score}
          onOptionClick={handleOptionClick}
          onCheck={handleCheckAnswer}
          onNext={handleNextQuestion}
          onReturn={handleReturnToStart}
          getButtonClass={getButtonClass}
        />
      )}
    </>
  );
};

export default FlagQuizApp;

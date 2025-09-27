'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Ruby from './Ruby';
import Confetti from './Confetti';
import SelectingView from './SelectingView';
import GameView from './GameView';
import ResultsView from './ResultsView';
import {
  Country,
  Difficulty,
  GameState,
  ErrorCode,
} from './types';

// --- 主要国リスト ---
const easyCountries = [
  'China', 'India', 'United States', 'Indonesia', 'Pakistan', 'Nigeria', 'Brazil', 'Bangladesh', 'Russia', 'Mexico', 'Japan', 'Ethiopia', 'Philippines', 'Egypt', 'Vietnam', 'DR Congo', 'Turkey', 'Iran', 'Germany', 'Thailand', 'United Kingdom', 'France', 'Italy', 'Tanzania', 'South Africa', 'Myanmar', 'Kenya', 'South Korea', 'Colombia', 'Spain', 'Uganda', 'Argentina', 'Algeria', 'Sudan', 'Ukraine', 'Iraq', 'Afghanistan', 'Poland', 'Canada', 'Morocco', 'Saudi Arabia', 'Uzbekistan', 'Peru', 'Angola', 'Malaysia', 'Mozambique', 'Ghana', 'Yemen', 'Nepal', 'Venezuela',
];

const normalCountries = [
  ...easyCountries,
  'Ivory Coast', 'Madagascar', 'Cameroon', 'North Korea', 'Australia', 'Niger', 'Sri Lanka', 'Burkina Faso', 'Mali', 'Romania', 'Malawi', 'Chile', 'Kazakhstan', 'Zambia', 'Guatemala', 'Ecuador', 'Syria', 'Netherlands', 'Senegal', 'Cambodia', 'Chad', 'Somalia', 'Zimbabwe', 'Guinea', 'Rwanda', 'Benin', 'Burundi', 'Tunisia', 'Bolivia', 'Belgium', 'Haiti', 'Cuba', 'South Sudan', 'Dominican Republic', 'Czech Republic', 'Greece', 'Jordan', 'Portugal', 'Azerbaijan', 'Sweden', 'Honduras', 'United Arab Emirates', 'Hungary', 'Tajikistan', 'Belarus', 'Austria', 'Papua New Guinea', 'Serbia', 'Israel', 'Switzerland',
];

const FlagQuizApp: React.FC = () => {
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [quizCountries, setQuizCountries] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>('loading');
  const [errorCode, setErrorCode] = useState<ErrorCode>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | 'all' | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations,flags');
        if (!response.ok) throw new Error('API fetch failed');
        let data: Country[] = await response.json();
        const filteredData = data.filter(c => c.translations.jpn?.common && c.flags.svg && c.name.common);
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

  const setupQuestion = useCallback(() => {
    if (quizCountries.length < 4) {
      setErrorCode('SETUP');
      setGameState('error');
      return;
    }

    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowConfetti(false);

    const shuffled = [...quizCountries].sort(() => 0.5 - Math.random());
    const selectedCountries = shuffled.slice(0, 4);
    const correctCountry = selectedCountries[0];
    const choiceNames = selectedCountries.map(c => c.translations.jpn.common);
    const shuffledOptions = choiceNames.sort(() => 0.5 - Math.random());

    setCurrentCountry(correctCountry);
    setOptions(shuffledOptions);
    setQuestionCount(prev => prev + 1);
  }, [quizCountries]);

  const startGame = (num: number | 'all') => {
    if (!difficulty) return;
    let filtered: Country[] = [];
    if (difficulty === 'easy') filtered = allCountries.filter(c => easyCountries.includes(c.name.common));
    else if (difficulty === 'normal') filtered = allCountries.filter(c => normalCountries.includes(c.name.common));
    else filtered = allCountries;

    if (filtered.length < 4) {
      setErrorCode('SETUP');
      setGameState('error');
      return;
    }

    setQuizCountries(filtered);
    setTotalQuestions(num);
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
      setScore(prev => prev + 1);
      setShowConfetti(true);
    }
  };

  const handleNextQuestion = () => {
    if (typeof totalQuestions === 'number' && questionCount >= totalQuestions) setGameState('results');
    else setupQuestion();
  };

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
    if (!isAnswered) return selectedAnswer === option ? 'bg-yellow-300 transform scale-105' : 'bg-white hover:bg-yellow-100';
    const isCorrect = option === currentCountry?.translations.jpn.common;
    if (isCorrect) return 'bg-green-400 text-white transform scale-105 animate-pulse';
    if (selectedAnswer === option && !isCorrect) return 'bg-red-400 text-white';
    return 'bg-gray-200 text-gray-500';
  };

  if (gameState === 'loading') return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <p className="text-2xl font-bold text-blue-600">いま、せかいの<Ruby rt="こっき">国旗</Ruby>をあつめているよ！</p>
    </div>
  );

  if (gameState === 'error') return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="text-xl font-bold text-red-600 text-center leading-relaxed p-4">
        {errorCode === 'FETCH' && (
          <p><Ruby rt="くに">国</Ruby>のデータの<Ruby rt="よ">読</Ruby>み<Ruby rt="こ">込</Ruby>みに<Ruby rt="しっぱい">失敗</Ruby>しました。<br/>ページを<Ruby rt="こうしん">更新</Ruby>してみてください。</p>
        )}
        {errorCode === 'SETUP' && (
          <p>クイズを<Ruby rt="さくせい">作成</Ruby>するのに<Ruby rt="じゅうぶん">十分</Ruby>な<Ruby rt="くに">国</Ruby>データがありません。</p>
        )}
      </div>
    </div>
  );

  if (gameState === 'selecting') {
    return <SelectingView difficulty={difficulty} setDifficulty={setDifficulty} startGame={startGame} />;
  }

  if (gameState === 'results') {
    return <ResultsView score={score} questionCount={questionCount} totalQuestions={totalQuestions} showConfetti={showConfetti} onPlayAgain={handlePlayAgain} onReturn={handleReturnToStart} />;
  }

  if (gameState === 'playing' && !currentCountry) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <p className="text-2xl font-bold text-blue-600">もんだいをつくってるよ！</p>
      </div>
    );
  }

  return (
    <>{showConfetti && <Confetti />}
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


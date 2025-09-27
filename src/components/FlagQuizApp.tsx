'use client';

import React, { useState, useEffect, useCallback } from 'react';

// 国データの型定義
type Country = {
  name: {
    common: string;
  };
  translations: {
    jpn: {
      common: string;
    };
  };
  flags: {
    svg: string;
    png: string;
  };
};

// 難易度の型定義
type Difficulty = 'easy' | 'normal' | 'hard';
// ゲームの状態の型定義
type GameState = 'selecting' | 'playing' | 'loading' | 'error' | 'results';
// エラーコードの型定義
type ErrorCode = 'FETCH' | 'SETUP' | null;

// 紙吹雪のパーティクルの型定義
type ConfettiParticle = {
  id: number;
  style: React.CSSProperties;
  content: string; // emoji or empty string for a shape
};

// --- 主要国リスト ---
// やさしいモード (50カ国)
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
// ふつうモード (やさしい + 50カ国 = 100カ国)
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

// ルビ（ふりがな）を表示するためのコンポーネント
const Ruby: React.FC<{ children: React.ReactNode; rt: string }> = ({
  children,
  rt,
}) => (
  <ruby>
    {children}
    <rp>(</rp>
    <rt style={{ fontSize: '0.6em', color: '#333' }}>{rt}</rt>
    <rp>)</rp>
  </ruby>
);

// 紙吹雪コンポーネント
const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    const emojis = ['🎉', '🎊', '✨', '🎈', '🥳', '🏆', '⭐', '👏', '💯'];
    const colors = [
      '#f44336',
      '#e91e63',
      '#9c27b0',
      '#673ab7',
      '#3f51b5',
      '#2196f3',
      '#03a9f4',
      '#00bcd4',
      '#009688',
      '#4caf50',
      '#8bc34a',
      '#cddc39',
      '#ffeb3b',
      '#ffc107',
      '#ff9800',
      '#ff5722',
    ];

    const newParticles = Array.from({ length: 150 }).map((_, index) => {
      const isEmoji = Math.random() > 0.5;

      const baseStyle: React.CSSProperties = {
        position: 'fixed',
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * -100 - 20}vh`,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `fall 3s linear ${Math.random() * 2}s forwards`,
        zIndex: 100,
        opacity: 0,
      };

      if (isEmoji) {
        return {
          id: index,
          content: emojis[Math.floor(Math.random() * emojis.length)],
          style: {
            ...baseStyle,
            fontSize: `${Math.random() * 20 + 20}px`, // Emoji size
          },
        };
      } else {
        return {
          id: index,
          content: '',
          style: {
            ...baseStyle,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          },
        };
      }
    });
    setParticles(newParticles);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(150vh) rotate(720deg); }
        }
      `}</style>
      <div className='confetti-container' aria-hidden='true'>
        {particles.map((p) => (
          <div key={p.id} style={p.style}>
            {p.content}
          </div>
        ))}
      </div>
    </>
  );
};

// メインのクイズアプリコンポーネント
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
  const [totalQuestions, setTotalQuestions] = useState<number | 'all' | null>(
    null
  );

  // REST Countries APIから国データを取得
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,translations,flags'
        );
        if (!response.ok) {
          throw new Error('API fetch failed');
        }
        let data: Country[] = await response.json();
        const filteredData = data.filter(
          (c) => c.translations.jpn?.common && c.flags.svg && c.name.common
        );
        setAllCountries(filteredData);
        setGameState('selecting');
      } catch (err) {
        setErrorCode('FETCH');
        setGameState('error');
        console.error(err);
      }
    };
    fetchCountries();
  }, []);

  // 新しい問題を作成する関数
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
    const choiceNames = selectedCountries.map((c) => c.translations.jpn.common);

    const shuffledOptions = choiceNames.sort(() => 0.5 - Math.random());

    setCurrentCountry(correctCountry);
    setOptions(shuffledOptions);
    setQuestionCount((prev) => prev + 1);
  }, [quizCountries]);

  // ゲーム開始処理
  const startGame = (num: number | 'all') => {
    if (!difficulty) return;

    let filtered: Country[] = [];
    if (difficulty === 'easy') {
      filtered = allCountries.filter((c) =>
        easyCountries.includes(c.name.common)
      );
    } else if (difficulty === 'normal') {
      filtered = allCountries.filter((c) =>
        normalCountries.includes(c.name.common)
      );
    } else {
      filtered = allCountries;
    }

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

  // 最初の問題を作成
  useEffect(() => {
    if (gameState === 'playing' && questionCount === 0) {
      setupQuestion();
    }
  }, [gameState, questionCount, setupQuestion]);

  // 答えを選択したときの処理
  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  // 答え合わせボタンの処理
  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentCountry) return;

    setIsAnswered(true);
    if (selectedAnswer === currentCountry.translations.jpn.common) {
      setScore((prev) => prev + 1);
      setShowConfetti(true);
    }
  };

  const handleNextQuestion = () => {
    if (typeof totalQuestions === 'number' && questionCount >= totalQuestions) {
      setGameState('results');
    } else {
      setupQuestion();
    }
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

  // ボタンのスタイルを決定する
  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? 'bg-yellow-300 transform scale-105'
        : 'bg-white hover:bg-yellow-100';
    }
    const isCorrect = option === currentCountry?.translations.jpn.common;
    if (isCorrect)
      return 'bg-green-400 text-white transform scale-105 animate-pulse';
    if (selectedAnswer === option && !isCorrect) return 'bg-red-400 text-white';
    return 'bg-gray-200 text-gray-500';
  };

  if (gameState === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-screen bg-blue-50'>
        <p className='text-2xl font-bold text-blue-600'>
          いま、せかいの<Ruby rt='こっき'>国旗</Ruby>をあつめているよ！
        </p>
      </div>
    );
  }

  if (gameState === 'error') {
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
  }

  if (gameState === 'selecting') {
    return (
      <div className='min-h-screen bg-blue-100 flex items-center justify-center p-4 font-sans'>
        <div className='w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center transition-all duration-500'>
          <h1 className='text-3xl md:text-4xl font-bold text-blue-800 mb-8'>
            <Ruby rt='こっき'>国旗</Ruby>あてクイズ！
          </h1>
          {!difficulty ? (
            <>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-700 mb-6'>
                むずかしさをえらんでね
              </h2>
              <div className='space-y-4'>
                <button
                  onClick={() => setDifficulty('easy')}
                  className='w-full py-4 bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transform hover:scale-105 transition-all'>
                  やさしい (50<Ruby rt='かこく'>カ国</Ruby>)
                </button>
                <button
                  onClick={() => setDifficulty('normal')}
                  className='w-full py-4 bg-yellow-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-all'>
                  ふつう (100<Ruby rt='かこく'>カ国</Ruby>)
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className='w-full py-4 bg-red-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all'>
                  むずかしい (ぜんぶ)
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-700 mb-6'>
                もんだいの<Ruby rt='かず'>数</Ruby>をえらんでね
              </h2>
              <div className='space-y-4'>
                <button
                  onClick={() => startGame(5)}
                  className='w-full py-4 bg-sky-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all'>
                  5<Ruby rt='もん'>問</Ruby>
                </button>
                <button
                  onClick={() => startGame(10)}
                  className='w-full py-4 bg-sky-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all'>
                  10<Ruby rt='もん'>問</Ruby>
                </button>
                <button
                  onClick={() => startGame(20)}
                  className='w-full py-4 bg-sky-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all'>
                  20<Ruby rt='もん'>問</Ruby>
                </button>
                <button
                  onClick={() => startGame('all')}
                  className='w-full py-4 bg-purple-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-purple-600 transform hover:scale-105 transition-all'>
                  ぜんぶ
                </button>
              </div>
              <button
                onClick={() => setDifficulty(null)}
                className='mt-8 text-gray-600 hover:underline'>
                むずかしさに もどる
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className='min-h-screen bg-yellow-100 flex items-center justify-center p-4 font-sans'>
        {showConfetti && <Confetti />}
        <div className='w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center'>
          <h1 className='text-4xl font-bold text-yellow-800 mb-6'>
            <Ruby rt='けっか'>結果</Ruby>はっぴょう！
          </h1>
          <p className='text-2xl text-gray-700 mb-8 leading-relaxed'>
            {totalQuestions === 'all'
              ? `${questionCount - 1}もん`
              : `${totalQuestions}もん`}
            ちゅう、
            <span className='text-5xl font-bold text-red-500 mx-2'>
              {score}
            </span>
            もん<Ruby rt='せいかい'>正解</Ruby>！
          </p>
          <div className='space-y-4'>
            <button
              onClick={handlePlayAgain}
              className='w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all'>
              <Ruby rt='おな'>同</Ruby>じせっていで もいちど！
            </button>
            <button
              onClick={handleReturnToStart}
              className='w-full py-4 bg-gray-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-gray-700 transform hover:scale-105 transition-all'>
              <Ruby rt='さいしょ'>最初</Ruby>にもどる
            </button>
          </div>
        </div>
      </div>
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
    <div className='min-h-screen bg-blue-100 flex items-center justify-center p-4 font-sans'>
      {showConfetti && <Confetti />}
      <div className='w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center text-gray-800'>
        <header className='mb-6 relative'>
          <h1 className='text-3xl md:text-4xl font-bold text-blue-800 mb-2'>
            <Ruby rt='こっき'>国旗</Ruby>あてクイズ！
          </h1>
          <div className='flex justify-between text-xl md:text-2xl font-semibold text-gray-700'>
            <span>
              もんだい: {questionCount}
              {totalQuestions !== 'all' && ` / ${totalQuestions}`}
            </span>
            <span>とくてん: {score}</span>
          </div>
          <button
            onClick={handleReturnToStart}
            className='absolute top-0 left-0 text-sm text-blue-600 hover:underline'>
            <Ruby rt='さいしょ'>最初</Ruby>にもどる
          </button>
        </header>

        <main>
          <div className='mb-6 bg-white p-4 rounded-2xl shadow-inner border border-gray-200'>
            <img
              src={currentCountry!.flags.svg}
              alt='国旗（こっき）'
              className='w-full h-auto max-h-60 object-contain drop-shadow-lg'
            />
          </div>

          <h2 className='text-xl md:text-2xl font-bold mb-6'>
            この<Ruby rt='こっき'>国旗</Ruby>はどこの<Ruby rt='くに'>国</Ruby>
            でしょう？
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full p-4 text-lg md:text-xl font-bold rounded-full shadow-md transition-all duration-300 ${getButtonClass(
                  option
                )}`}>
                {option}
              </button>
            ))}
          </div>

          {isAnswered ? (
            <div className='flex flex-col items-center'>
              {selectedAnswer === currentCountry!.translations.jpn.common ? (
                <p className='text-2xl font-bold text-green-600 mb-4 animate-bounce'>
                  🎉 せいかい！ 🎉
                </p>
              ) : (
                <p className='text-2xl font-bold text-red-600 mb-4'>
                  ざんねん...
                </p>
              )}
              <p className='text-lg mb-4'>
                こたえは「{currentCountry!.translations.jpn.common}」でした！
              </p>
              <button
                onClick={handleNextQuestion}
                className='w-full max-w-sm px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 transition-transform'>
                つぎのもんだいへ
              </button>
            </div>
          ) : (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
              className='w-full max-w-sm px-8 py-4 bg-yellow-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
              こたえあわせ
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default FlagQuizApp;

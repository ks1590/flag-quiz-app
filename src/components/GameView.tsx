'use client';

import React from 'react';
import Ruby from './Ruby';
import { Country } from './types';

const GameView: React.FC<{
  currentCountry: Country;
  options: string[];
  selectedAnswer: string | null;
  isAnswered: boolean;
  questionCount: number;
  totalQuestions: number | 'all' | null;
  score: number;
  onOptionClick: (option: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onReturn: () => void;
  getButtonClass: (option: string) => string;
}> = ({
  currentCountry,
  options,
  selectedAnswer,
  isAnswered,
  questionCount,
  totalQuestions,
  score,
  onOptionClick,
  onCheck,
  onNext,
  onReturn,
  getButtonClass,
}) => {
  const regionTranslations: Record<string, string> = {
    Africa: 'アフリカ',
    Americas: 'アメリカ',
    Asia: 'アジア',
    Europe: 'ヨーロッパ',
    Oceania: 'オセアニア',
    Antarctic: '南極',
  };

  const capitalTranslations: Record<string, string> = {
    Beijing: 'ペキン',
    'New Delhi': 'ニューデリー',
    'Washington, D.C.': 'ワシントンD.C.',
    Jakarta: 'ジャカルタ',
    Islamabad: 'イスラマバード',
    Abuja: 'アブジャ',
    Brasília: 'ブラジリア',
    Dhaka: 'ダッカ',
    Moscow: 'モスクワ',
    'Mexico City': 'メキシコシティ',
    Tokyo: '東京',
    'Addis Ababa': 'アディスアベバ',
    Manila: 'マニラ',
    Cairo: 'カイロ',
    Hanoi: 'ハノイ',
    Kinshasa: 'キンシャサ',
    Ankara: 'アンカラ',
    Tehran: 'テヘラン',
    Berlin: 'ベルリン',
    Bangkok: 'バンコク',
    London: 'ロンドン',
    Paris: 'パリ',
    Rome: 'ローマ',
    Dodoma: 'ドドマ',
    Pretoria: 'プレトリア',
    Naypyidaw: 'ネピドー',
    Nairobi: 'ナイロビ',
    Seoul: 'ソウル',
    Bogotá: 'ボゴタ',
    Madrid: 'マドリード',
    Kampala: 'カンパラ',
    'Buenos Aires': 'ブエノスアイレス',
    Algiers: 'アルジェ',
    Khartoum: 'ハルツーム',
    Kyiv: 'キーウ',
    Baghdad: 'バグダッド',
    Kabul: 'カブール',
    Warsaw: 'ワルシャワ',
    Ottawa: 'オタワ',
    Rabat: 'ラバト',
    Riyadh: 'リヤド',
    Tashkent: 'タシケント',
    Lima: 'リマ',
    Luanda: 'ルアンダ',
    'Kuala Lumpur': 'クアラルンプール',
    Maputo: 'マプト',
    Accra: 'アクラ',
    "Sana'a": 'サナア',
    Kathmandu: 'カトマンズ',
    Caracas: 'カラカス',
  };
  return (
    <div className='min-h-screen bg-blue-100 flex items-center justify-center p-4 font-sans'>
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
            onClick={onReturn}
            className='absolute top-0 left-0 text-sm text-blue-600 hover:underline'>
            <Ruby rt='さいしょ'>最初</Ruby>にもどる
          </button>
        </header>

        <main>
          <div className='mb-6 bg-white p-4 rounded-2xl shadow-inner border border-gray-200'>
            <img
              src={currentCountry.flags.svg}
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
                onClick={() => onOptionClick(option)}
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
              {selectedAnswer === currentCountry.translations.jpn.common ? (
                <p className='text-2xl font-bold text-green-600 mb-4 animate-bounce'>
                  🎉 せいかい！ 🎉
                </p>
              ) : (
                <p className='text-2xl font-bold text-red-600 mb-4'>
                  ざんねん...
                </p>
              )}
              <div className='w-full bg-blue-50 p-4 rounded-lg text-left text-lg mb-4 space-y-2 border border-blue-200'>
                <p>
                  <Ruby rt='こた'>答</Ruby>え：{' '}
                  <span className='font-bold text-2xl text-blue-700'>
                    {currentCountry.translations.jpn.common}
                  </span>
                </p>
                <p>
                  <Ruby rt='しゅと'>首都</Ruby>：{' '}
                  <span className='font-bold'>
                    {(() => {
                      const cap = currentCountry.capital?.[0];
                      if (!cap) return '-';
                      return capitalTranslations[cap] || cap;
                    })()}
                  </span>
                </p>
                <p>
                  <Ruby rt='ちいき'>地域</Ruby>：{' '}
                  <span className='font-bold'>
                    {regionTranslations[currentCountry.region] ||
                      currentCountry.region}
                  </span>
                </p>
              </div>
              {(() => {
                const isFinal =
                  typeof totalQuestions === 'number' &&
                  questionCount >= totalQuestions;
                return (
                  <button
                    onClick={onNext}
                    className='w-full max-w-sm px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 transition-transform'>
                    {isFinal ? '結果を見る' : 'つぎのもんだいへ'}
                  </button>
                );
              })()}
            </div>
          ) : (
            <button
              onClick={onCheck}
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

export default GameView;

'use client';

import React from 'react';
import Ruby from './Ruby';
import Confetti from './Confetti';

const ResultsView: React.FC<{
  score: number;
  questionCount: number | null;
  totalQuestions: number | 'all' | null;
  showConfetti: boolean;
  onReturn: () => void;
  bestScore?: number | null;
}> = ({
  score,
  questionCount,
  totalQuestions,
  showConfetti,
  onReturn,
  bestScore = null,
}) => {
  return (
    <div className='min-h-screen bg-yellow-100 flex items-center justify-center p-4 font-sans'>
      {showConfetti && <Confetti />}
      <div className='w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center'>
        <h1 className='text-4xl font-bold text-yellow-800 mb-6'>
          <Ruby rt='けっか'>結果</Ruby>はっぴょう！
        </h1>
        <p className='text-2xl text-gray-700 mb-8 leading-relaxed'>
          {totalQuestions === 'all'
            ? `${questionCount && questionCount - 1}もん`
            : `${totalQuestions}もん`}
          ちゅう、
          <span className='text-5xl font-bold text-red-500 mx-2'>{score}</span>
          もん<Ruby rt='せいかい'>正解</Ruby>！
        </p>
        <div className='text-sm text-gray-600 mb-4'>
          {bestScore !== null && (
            <div>
              最高得点: <strong className='text-gray-800'>{bestScore}</strong>
            </div>
          )}
        </div>
        <div className='space-y-4'>
          <button
            onClick={onReturn}
            className='w-full py-4 bg-gray-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-gray-700 transform hover:scale-105 transition-all'>
            <Ruby rt='さいしょ'>最初</Ruby>にもどる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;

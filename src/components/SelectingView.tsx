'use client';

import React from 'react';
import Ruby from './Ruby';
import { Difficulty } from './types';

const SelectingView: React.FC<{
  difficulty: Difficulty | null;
  setDifficulty: (d: Difficulty | null) => void;
  startGame: (num: number | 'all') => void;
}> = ({ difficulty, setDifficulty, startGame }) => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center transition-all duration-500">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-8">
          <Ruby rt="こっき">国旗</Ruby>あてクイズ！
        </h1>
        {!difficulty ? (
          <>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">むずかしさをえらんでね</h2>
            <div className="space-y-4">
              <button onClick={() => setDifficulty('easy')} className="w-full py-4 bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transform hover:scale-105 transition-all">やさしい (50<Ruby rt="かこく">カ国</Ruby>)</button>
              <button onClick={() => setDifficulty('normal')} className="w-full py-4 bg-yellow-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-all">ふつう (100<Ruby rt="かこく">カ国</Ruby>)</button>
              <button onClick={() => setDifficulty('hard')} className="w-full py-4 bg-red-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all">むずかしい (ぜんぶ)</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">もんだいの<Ruby rt="かず">数</Ruby>をえらんでね</h2>
            <div className="space-y-4">
              <button onClick={() => startGame(5)} className="w-full py-4 bg-sky-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all">5<Ruby rt="もん">問</Ruby></button>
              <button onClick={() => startGame(10)} className="w-full py-4 bg-sky-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all">10<Ruby rt="もん">問</Ruby></button>
              <button onClick={() => startGame(20)} className="w-full py-4 bg-sky-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all">20<Ruby rt="もん">問</Ruby></button>
              <button onClick={() => startGame('all')} className="w-full py-4 bg-purple-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-purple-600 transform hover:scale-105 transition-all">ぜんぶ</button>
            </div>
            <button onClick={() => setDifficulty(null)} className="mt-8 text-gray-600 hover:underline">むずかしさに もどる</button>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectingView;

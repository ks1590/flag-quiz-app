// 共通の型定義
export type Country = {
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

export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameState = 'selecting' | 'playing' | 'loading' | 'error' | 'results';
export type ErrorCode = 'FETCH' | 'SETUP' | null;

export type ConfettiParticle = {
  id: number;
  style: React.CSSProperties;
  content: string;
};

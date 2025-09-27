'use client';

import React, { useEffect, useState } from 'react';
import { ConfettiParticle } from './types';

const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    const emojis = ['🎉', '🎊', '✨', '🎈', '🥳', '🏆', '⭐', '👏', '💯'];
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
      '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
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
            fontSize: `${Math.random() * 20 + 20}px`,
          },
        };
      }

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
      <div className="confetti-container" aria-hidden="true">
        {particles.map((p) => (
          <div key={p.id} style={p.style}>
            {p.content}
          </div>
        ))}
      </div>
    </>
  );
};

export default Confetti;

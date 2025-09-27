'use client';

import React, { useEffect, useState } from 'react';
import { ConfettiParticle } from './types';

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

      // horizontal start position (vw)
      const leftPct = Math.random() * 100;
      // move toward center: positive if start left of center, negative if right
      const centerFactor = 50 - leftPct;
      // scale how far to move horizontally (edges move more)
      const horizScale = 0.6 + Math.random() * 1.4;
      const dxValue = centerFactor * horizScale; // in vw
      const midXValue = dxValue * (0.4 + Math.random() * 0.4);
      const peak = 30 + Math.random() * 50; // peak height in vh

      const baseStyle: React.CSSProperties = {
        position: 'fixed',
        left: `${leftPct}vw`,
        bottom: `${Math.random() * 4 + 1}vh`, // slightly above bottom
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `shoot ${
          2.2 + Math.random() * 1.2
        }s cubic-bezier(.22,.9,.3,1) ${Math.random() * 0.6}s forwards`,
        zIndex: 100,
        opacity: 0,
        willChange: 'transform, opacity',
        pointerEvents: 'none',
      } as React.CSSProperties;

      const varStyle: React.CSSProperties = {
        ['--dx' as any]: `${dxValue}vw`,
        ['--midX' as any]: `${midXValue}vw`,
        ['--peak' as any]: `${peak}vh`,
      } as React.CSSProperties;

      if (isEmoji) {
        return {
          id: index,
          content: emojis[Math.floor(Math.random() * emojis.length)],
          style: {
            ...baseStyle,
            ...varStyle,
            fontSize: `${Math.random() * 20 + 20}px`,
          },
        };
      }

      return {
        id: index,
        content: '',
        style: {
          ...baseStyle,
          ...varStyle,
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
        @keyframes shoot {
          0% { opacity: 1; transform: translateX(0) translateY(0) rotate(0deg); }
          25% { transform: translateX(calc(var(--midX) * 0.5)) translateY(calc(var(--peak) * -0.5)) rotate(90deg); }
          50% { transform: translateX(var(--midX)) translateY(calc(var(--peak) * -1)) rotate(180deg); }
          75% { transform: translateX(calc(var(--midX) + var(--dx) * 0.5)) translateY(calc(var(--peak) * -0.5)) rotate(360deg); }
          100% { opacity: 0; transform: translateX(var(--dx)) translateY(10vh) rotate(450deg); }
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

export default Confetti;

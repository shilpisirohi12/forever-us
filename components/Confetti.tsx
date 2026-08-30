'use client';

import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#fda4af', '#e11d48', '#be123c', '#ffe4e6'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#ec4899', '#f43f5e', '#fbbf24', '#fbcfe8'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#f43f5e', '#fb7185', '#e11d48'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#fda4af', '#fbbf24'],
  });
};

export const fireHearts = () => {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#e11d48', '#f43f5e', '#fb7185'],
    shapes: ['circle'],
    scalar: 1.2,
  });
};

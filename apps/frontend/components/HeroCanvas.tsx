"use client";

import React, { useMemo } from 'react';

/**
 * Lightweight, hardware-accelerated starfield background.
 * Replaces heavy WebGL canvas to prevent browser tab freezes while retaining aesthetic visual ambiance.
 */
export default function HeroCanvas() {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full opacity-60">
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="#a78bfa"
            opacity={star.opacity}
          >
            <animate
              attributeName="opacity"
              values={`${star.opacity};${star.opacity * 0.2};${star.opacity}`}
              dur={`${star.duration}s`}
              begin={`${star.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}


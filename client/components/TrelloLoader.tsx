'use client'

import React from 'react'

type Props = {
  label?: string
  className?: string
}

export default function TrelloLoader({ label = 'Loading', className = '' }: Props) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-label={label}>
      <div className="flex items-end gap-1.5 h-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`trello-bar w-1.5 rounded-full ${i % 2 === 0 ? 'bg-violet-600' : 'bg-violet-400'} ${
              i % 2 === 0 ? 'trello-bar--even' : 'trello-bar--odd'
            }`}
          />
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes trelloBars {
          0% {
            transform: scaleY(0.35);
            opacity: 0.55;
          }
          40% {
            transform: scaleY(1);
            opacity: 1;
          }
          100% {
            transform: scaleY(0.35);
            opacity: 0.55;
          }
        }
        .trello-bar {
          height: 100%;
          transform-origin: bottom;
          animation: trelloBars 900ms ease-in-out infinite;
        }
        .trello-bar--odd {
          /* Half-cycle phase shift so bars alternate high/low */
          animation-delay: -450ms;
        }
      `}} />
    </div>
  )
}


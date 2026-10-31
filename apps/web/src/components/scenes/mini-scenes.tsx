import { Cat, Dog } from './pets';
import { s } from './classes';

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className={`${s.scene} w-full`}>
      <rect width="240" height="160" fill="#fdf3e4" />
      <path d="M0 128 C 80 120, 160 134, 240 124 L 240 160 L 0 160 Z" fill="#cfe3d6" />
      {children}
    </svg>
  );
}

export function LeashWalk() {
  return (
    <Frame label="Illustration: a dog trots calmly on a loose leash">
      <g className={s.ground} fill="#8fbf9f">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${i * 60 + 10} 140 l 4 -8 l 4 8 M${i * 60 + 40} 150 l 3 -6 l 3 6`} />
        ))}
      </g>
      <g className={s.bob}>
        <path
          d="M30 10 C 60 70, 100 70, 136 76"
          stroke="#1f6f5c"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <g transform="translate(66 56)">
          <Dog />
        </g>
      </g>
      <circle cx="30" cy="10" r="9" fill="#c98d66" />
    </Frame>
  );
}

export function Fetch() {
  return (
    <Frame label="Illustration: a dog chases a ball and brings it back">
      <g className={s.fetchDog}>
        <g transform="translate(10 58) scale(0.85)">
          <Dog coat="#b98a5a" />
        </g>
      </g>
      <g className={s.ball}>
        <circle cx="70" cy="112" r="9" fill="#d6e24f" stroke="#9aa52a" strokeWidth={1.5} />
        <path d="M62 108 q 8 6 16 0" stroke="#fff" strokeWidth={1.5} fill="none" />
      </g>
    </Frame>
  );
}

export function CatTarget() {
  return (
    <Frame label="Illustration: a cat swipes at a feather toy during target training">
      <g className={s.wand}>
        <path
          d="M24 26 C 84 14, 118 20, 138 44"
          stroke="#7a4310"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <path d="M138 44 l -8 18 l 14 -10 l 2 18 l 6 -22 z" fill="#f08a6c" />
        <circle cx="140" cy="46" r="3" fill="#e8a33d" />
      </g>
      <g transform="translate(78 54)">
        <Cat swipe />
      </g>
    </Frame>
  );
}

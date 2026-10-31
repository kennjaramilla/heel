import { Cat, Dog, PawPrint, Trainer } from './pets';
import { s } from './classes';

/** Hero illustration: a dog clears a hurdle and gets a treat. Loops every ~5 seconds. */
export function TrainingYard({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 380"
      role="img"
      aria-label="Illustration: a dog runs, jumps a hurdle and gets a treat from its trainer"
      className={`${s.scene} ${className ?? ''}`}
    >
      <defs>
        <linearGradient id="yard-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fde8d0" />
          <stop offset="1" stopColor="#fbf7f0" />
        </linearGradient>
        <pattern id="hurdle-stripes" width="24" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#f08a6c" />
          <rect x="12" width="12" height="12" fill="#ffffff" />
        </pattern>
      </defs>
      <rect width="560" height="380" fill="url(#yard-sky)" />
      <circle cx="460" cy="78" r="38" fill="#f6b896" opacity="0.8" />
      <g className={s.cloud} fill="#ffffff" opacity="0.9">
        <ellipse cx="120" cy="70" rx="42" ry="14" />
        <ellipse cx="146" cy="58" rx="26" ry="14" />
      </g>
      <g className={`${s.cloud} ${s.cloudSlow}`} fill="#ffffff" opacity="0.75">
        <ellipse cx="330" cy="112" rx="34" ry="11" />
        <ellipse cx="352" cy="102" rx="20" ry="11" />
      </g>
      <path d="M0 290 C 120 270, 260 300, 560 282 L 560 380 L 0 380 Z" fill="#cfe3d6" />
      <path d="M0 316 C 160 300, 340 330, 560 310 L 560 380 L 0 380 Z" fill="#b9d8c4" />
      <g fill="#1f6f5c" opacity="0.18">
        {[0, 1, 2, 3, 4].map((i) => (
          <PawPrint key={i} x={60 + i * 44} y={i % 2 ? 312 : 322} className={s.print} />
        ))}
      </g>
      <g>
        <rect x="282" y="230" width="8" height="74" rx="3" fill="#7a4310" />
        <rect x="336" y="230" width="8" height="74" rx="3" fill="#7a4310" />
        <rect x="276" y="238" width="74" height="12" rx="6" fill="url(#hurdle-stripes)" />
      </g>
      <g transform="translate(470 182)">
        <Trainer armClassName={s.trainerArm} />
      </g>
      <g transform="translate(40 228)">
        <Dog className={s.heroDog} />
      </g>
      <g className={s.bubble}>
        <rect x="350" y="120" width="112" height="40" rx="20" fill="#ffffff" stroke="#e8e0d3" />
        <path d="M372 158 L 366 172 L 386 159 Z" fill="#ffffff" />
        <text
          x="406"
          y="146"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#1f4a3e"
          fontFamily="var(--font-bricolage), sans-serif"
        >
          Good dog!
        </text>
      </g>
      <g fill="#f08a6c">
        <path
          className={s.heart}
          d="M400 214 c -6 -8 -16 -2 -10 6 l 10 9 l 10 -9 c 6 -8 -4 -14 -10 -6 z"
        />
        <path
          className={`${s.heart} ${s.heart2}`}
          d="M424 200 c -4 -6 -11 -1 -7 4 l 7 6 l 7 -6 c 4 -5 -3 -10 -7 -4 z"
        />
      </g>
      <g transform="translate(30 268) scale(0.62)" opacity="0.95">
        <Cat />
      </g>
    </svg>
  );
}

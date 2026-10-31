import { s } from './classes';

// Hand-drawn SVG pets. Both face right with their feet on y = 74.

export function Dog({
  coat = '#e8a33d',
  running = true,
  className,
}: {
  coat?: string;
  running?: boolean;
  className?: string;
}) {
  const leg = (x: number, cls: string, shade = false) => (
    <rect
      x={x}
      y={48}
      width={9}
      height={26}
      rx={4.5}
      fill={shade ? '#b97a22' : coat}
      className={running ? cls : undefined}
    />
  );
  return (
    <g className={className}>
      <path
        d="M20 40 C 10 34, 6 22, 12 12"
        stroke={coat}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        className={s.tail}
      />
      {leg(24, s.legB, true)}
      {leg(64, s.legA, true)}
      <ellipse cx={46} cy={42} rx={31} ry={17} fill={coat} />
      <ellipse cx={50} cy={50} rx={20} ry={8} fill="#fff6e9" />
      {leg(32, s.legA)}
      {leg(72, s.legB)}
      <rect
        x={66}
        y={26}
        width={9}
        height={14}
        rx={3}
        fill="#2e3fbf"
        transform="rotate(-20 70 33)"
      />
      <circle cx={84} cy={26} r={17} fill={coat} />
      <path d="M72 16 L 73 0 L 84 11 Z" fill="#b97a22" className={s.ear} />
      <path d="M88 10 L 97 -2 L 98 16 Z" fill="#b97a22" className={s.ear} />
      <ellipse cx={98} cy={32} rx={11} ry={8} fill="#fff6e9" />
      <circle cx={107} cy={29} r={3.4} fill="#1d2522" />
      <circle cx={89} cy={21} r={2.4} fill="#1d2522" />
      <circle cx={89.8} cy={20.2} r={0.8} fill="#fff" />
      <path
        d="M97 38 Q 101 42 105 38"
        stroke="#1d2522"
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={68} cy={40} r={3.2} fill="#e8a33d" stroke="#f5f6fb" strokeWidth={1.2} />
    </g>
  );
}

export function Cat({ className, swipe = false }: { className?: string; swipe?: boolean }) {
  return (
    <g className={className}>
      <path
        d="M14 50 C 0 40, 2 14, 16 8"
        stroke="#7d8696"
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        className={s.catTail}
      />
      <ellipse cx={40} cy={50} rx={24} ry={18} fill="#8f98a8" />
      <path
        d="M28 40 q 4 6 0 12 M38 36 q 4 7 0 14 M48 38 q 4 6 0 12"
        stroke="#6f7787"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <rect x={24} y={58} width={9} height={16} rx={4.5} fill="#7d8696" />
      <rect
        x={48}
        y={58}
        width={9}
        height={16}
        rx={4.5}
        fill="#8f98a8"
        className={swipe ? s.swipe : undefined}
      />
      <g className={swipe ? s.track : undefined}>
        <circle cx={62} cy={28} r={16} fill="#8f98a8" />
        <path d="M49 20 L 50 4 L 60 14 Z" fill="#8f98a8" />
        <path d="M64 14 L 74 4 L 75 20 Z" fill="#8f98a8" />
        <path d="M52 15 L 52.6 8 L 57 13 Z" fill="#f6b896" />
        <path d="M67 13 L 72 8 L 72.4 16 Z" fill="#f6b896" />
        <ellipse cx={56} cy={27} rx={2.6} ry={3.4} fill="#2f6b3c" />
        <ellipse cx={68} cy={27} rx={2.6} ry={3.4} fill="#2f6b3c" />
        <path d="M60 33 L 64 33 L 62 35.5 Z" fill="#e57f87" />
        <path
          d="M58 37 q 2 2 4 0 q 2 2 4 0"
          stroke="#4a505c"
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M52 33 L 42 31 M52 35 L 42 37 M72 33 L 82 31 M72 35 L 82 37"
          stroke="#e6e9ee"
          strokeWidth={1}
        />
      </g>
    </g>
  );
}

export function Trainer({ armClassName }: { armClassName?: string }) {
  return (
    <g>
      <rect x={14} y={78} width={11} height={44} rx={5} fill="#24302c" />
      <rect x={30} y={78} width={11} height={44} rx={5} fill="#24302c" />
      <rect x={8} y={30} width={40} height={56} rx={16} fill="#2e3fbf" />
      <path d="M20 34 L 28 48 L 36 34" stroke="#f5f6fb" strokeWidth={3} fill="none" />
      {/* Arm reaching toward the dog with a treat. */}
      <g className={armClassName}>
        <rect x={-22} y={38} width={36} height={11} rx={5.5} fill="#2e3fbf" />
        <circle cx={-24} cy={43.5} r={7} fill="#c98d66" />
        <path
          d="M-38 36 a3 3 0 1 1 4 -3 l 6 0 a3 3 0 1 1 4 3 a3 3 0 1 1 -4 3 l -6 0 a3 3 0 1 1 -4 -3 z"
          fill="#f5f6fb"
          stroke="#b97a22"
          strokeWidth={1.2}
        />
      </g>
      <circle cx={28} cy={16} r={15} fill="#c98d66" />
      <path d="M13 14 C 14 0, 42 0, 43 14 C 36 8, 22 8, 13 14 Z" fill="#3b2a1e" />
      <circle cx={22} cy={17} r={1.8} fill="#1d2522" />
      <circle cx={33} cy={17} r={1.8} fill="#1d2522" />
      <circle cx={19} cy={22} r={2.4} fill="#e8846f" opacity={0.5} />
      <circle cx={36} cy={22} r={2.4} fill="#e8846f" opacity={0.5} />
      <path
        d="M24 23 Q 27.5 26.5 31 23"
        stroke="#1d2522"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function PawPrint({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className={className}>
      <ellipse cx={0} cy={4} rx={5} ry={4} />
      <circle cx={-5} cy={-3} r={2} />
      <circle cx={-1.6} cy={-5.6} r={2} />
      <circle cx={2.2} cy={-5.6} r={2} />
      <circle cx={5.6} cy={-3} r={2} />
    </g>
  );
}

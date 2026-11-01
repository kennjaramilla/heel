// Frame-driven versions of the web's pet SVGs (apps/web/src/components/scenes/pets.tsx).
// Remotion renders frame by frame, so motion comes from props instead of CSS keyframes.

const legAt = (x: number, angle: number, fill: string) => (
  <rect
    x={x}
    y={48}
    width={9}
    height={26}
    rx={4.5}
    fill={fill}
    transform={`rotate(${angle} ${x + 4.5} 50)`}
  />
);

/** Faces right, feet on y = 74. `stride` swings the legs; `wag` swings the tail. */
export function Dog({
  stride = 0,
  wag = 0,
  coat = '#e8a33d',
}: {
  stride?: number;
  wag?: number;
  coat?: string;
}) {
  const shade = '#b97a22';
  return (
    <g>
      <path
        d="M20 40 C 10 34, 6 22, 12 12"
        stroke={coat}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(${wag} 20 40)`}
      />
      {legAt(24, -stride, shade)}
      {legAt(64, stride, shade)}
      <ellipse cx={46} cy={42} rx={31} ry={17} fill={coat} />
      <ellipse cx={50} cy={50} rx={20} ry={8} fill="#fff6e9" />
      {legAt(32, stride, coat)}
      {legAt(72, -stride, coat)}
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
      <path d="M72 16 L 73 0 L 84 11 Z" fill={shade} />
      <path d="M88 10 L 97 -2 L 98 16 Z" fill={shade} />
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
    </g>
  );
}

export function Cat({ tail = 0 }: { tail?: number }) {
  return (
    <g>
      <path
        d="M14 50 C 0 40, 2 14, 16 8"
        stroke="#7d8696"
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(${tail} 14 50)`}
      />
      <ellipse cx={40} cy={50} rx={24} ry={18} fill="#8f98a8" />
      <rect x={24} y={58} width={9} height={16} rx={4.5} fill="#7d8696" />
      <rect x={48} y={58} width={9} height={16} rx={4.5} fill="#8f98a8" />
      <circle cx={62} cy={28} r={16} fill="#8f98a8" />
      <path d="M49 20 L 50 4 L 60 14 Z" fill="#8f98a8" />
      <path d="M64 14 L 74 4 L 75 20 Z" fill="#8f98a8" />
      <ellipse cx={56} cy={27} rx={2.6} ry={3.4} fill="#2f6b3c" />
      <ellipse cx={68} cy={27} rx={2.6} ry={3.4} fill="#2f6b3c" />
      <path d="M60 33 L 64 33 L 62 35.5 Z" fill="#e57f87" />
    </g>
  );
}

function Face({ skin, hair }: { skin: string; hair: string }) {
  return (
    <>
      <circle cx={28} cy={16} r={15} fill={skin} />
      <path d="M13 14 C 14 0, 42 0, 43 14 C 36 8, 22 8, 13 14 Z" fill={hair} />
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
    </>
  );
}

/** The trainer, facing the viewer. `arm` rotates the raised arm (a wave or a treat). */
export function Trainer({ arm = 0, treat = true }: { arm?: number; treat?: boolean }) {
  return (
    <g>
      <rect x={14} y={78} width={11} height={44} rx={5} fill="#24302c" />
      <rect x={30} y={78} width={11} height={44} rx={5} fill="#24302c" />
      <rect x={8} y={30} width={40} height={56} rx={16} fill="#2e3fbf" />
      <path d="M20 34 L 28 48 L 36 34" stroke="#f5f6fb" strokeWidth={3} fill="none" />
      <g transform={`rotate(${arm} 12 43)`}>
        <rect x={-22} y={38} width={36} height={11} rx={5.5} fill="#2e3fbf" />
        <circle cx={-24} cy={43.5} r={7} fill="#c98d66" />
        {treat && (
          <path
            d="M-38 36 a3 3 0 1 1 4 -3 l 6 0 a3 3 0 1 1 4 3 a3 3 0 1 1 -4 3 l -6 0 a3 3 0 1 1 -4 -3 z"
            fill="#f5f6fb"
            stroke="#b97a22"
            strokeWidth={1.2}
          />
        )}
      </g>
      <Face skin="#c98d66" hair="#3b2a1e" />
    </g>
  );
}

/** The pet owner: pink top, leaning back by `lean` degrees, holding a leash at (-14, 50). */
export function Owner({ lean = 0 }: { lean?: number }) {
  return (
    <g transform={`rotate(${lean} 28 122)`}>
      <rect x={14} y={78} width={11} height={44} rx={5} fill="#2b3566" />
      <rect x={30} y={78} width={11} height={44} rx={5} fill="#2b3566" />
      <rect x={8} y={30} width={40} height={56} rx={16} fill="#d23c74" />
      <rect x={40} y={40} width={30} height={11} rx={5.5} fill="#d23c74" />
      <circle cx={72} cy={45.5} r={7} fill="#e0a982" />
      <path d="M12 12 C 10 -2, 46 -4, 44 14 L 46 30 L 10 30 Z" fill="#2a1a12" />
      <Face skin="#e0a982" hair="#2a1a12" />
    </g>
  );
}

export function PawPrint({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill={fill}>
      <ellipse cx={0} cy={4} rx={5} ry={4} />
      <circle cx={-5} cy={-3} r={2} />
      <circle cx={-1.6} cy={-5.6} r={2} />
      <circle cx={2.2} cy={-5.6} r={2} />
      <circle cx={5.6} cy={-3} r={2} />
    </g>
  );
}

export function TennisBall({ r = 40 }: { r?: number }) {
  return (
    <g>
      <circle r={r} fill="#d4ee3f" />
      <path
        d={`M${-r * 0.95} ${-r * 0.3} C ${-r * 0.3} ${-r * 0.2}, ${-r * 0.3} ${r * 0.6}, ${-r * 0.55} ${r * 0.82}`}
        stroke="#fff"
        strokeWidth={r * 0.09}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${r * 0.95} ${r * 0.3} C ${r * 0.3} ${r * 0.2}, ${r * 0.3} ${-r * 0.6}, ${r * 0.55} ${-r * 0.82}`}
        stroke="#fff"
        strokeWidth={r * 0.09}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

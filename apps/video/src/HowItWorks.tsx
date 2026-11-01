import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Cat, Dog, Owner, PawPrint, TennisBall, Trainer } from './pets';
import { body, c, heading } from './theme';
import {
  Cursor,
  Highlight,
  keys,
  Ripple,
  SceneFade,
  Screen,
  SHOT_H,
  SHOT_W,
  StepCopy,
  useSpring,
} from './ui';

export const FPS = 30;

// [start, length] of each scene; neighbours overlap by 10 frames for the crossfade.
const T = {
  problem: [0, 110],
  logo: [100, 72],
  find: [162, 150],
  pick: [302, 150],
  pay: [442, 150],
  meet: [582, 140],
  plan: [712, 150],
  outro: [852, 118],
} as const;
export const DURATION = T.outro[0] + T.outro[1];

const SCREEN = { left: 476, width: 740 };

export function HowItWorks() {
  return (
    <AbsoluteFill style={{ background: c.bg, fontFamily: body }}>
      <DriftingPaws />
      {(Object.keys(T) as (keyof typeof T)[]).map((name) => {
        const [from, length] = T[name];
        const Scene = scenes[name];
        return (
          <Sequence key={name} from={from} durationInFrames={length}>
            <SceneFade length={length}>
              <Scene />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

function DriftingPaws() {
  const frame = useCurrentFrame();
  return (
    <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 14 }, (_, i) => {
        const x = ((i * 97 + frame * 0.6) % 1400) - 60;
        const y = 60 + ((i * 151) % 600);
        return (
          <g key={i} transform={`rotate(${i % 2 ? 20 : -15} ${x} ${y})`} opacity={0.07}>
            <PawPrint x={x} y={y} fill={c.primary} />
          </g>
        );
      })}
    </svg>
  );
}

function Headline({
  children,
  at = 6,
  size = 64,
}: {
  children: string;
  at?: number;
  size?: number;
}) {
  const frame = useCurrentFrame();
  const t = keys(frame, [
    [at, 0],
    [at + 16, 1],
  ]);
  return (
    <div
      style={{
        fontFamily: heading,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: -1.5,
        lineHeight: 1.05,
        color: c.ink,
        textAlign: 'center',
        opacity: t,
        transform: `translateY(${(1 - t) * 24}px)`,
      }}
    >
      {children}
    </div>
  );
}

function Subline({ children, at }: { children: string; at: number }) {
  const frame = useCurrentFrame();
  const t = keys(frame, [
    [at, 0],
    [at + 14, 1],
  ]);
  return (
    <div
      style={{
        marginTop: 14,
        fontSize: 28,
        color: c.muted,
        textAlign: 'center',
        opacity: t,
        transform: `translateY(${(1 - t) * 14}px)`,
      }}
    >
      {children}
    </div>
  );
}

function Ground({ scroll = 0 }: { scroll?: number }) {
  return (
    <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={c.sky} />
          <stop offset="1" stopColor={c.bg} />
        </linearGradient>
      </defs>
      <rect width={1280} height={720} fill="url(#sky)" />
      <circle cx={1170} cy={300} r={46} fill={c.ball} opacity={0.9} />
      <path d="M0 600 C 300 570, 700 620, 1280 590 L 1280 720 L 0 720 Z" fill={c.grassLight} />
      <path d="M0 640 C 400 620, 860 660, 1280 630 L 1280 720 L 0 720 Z" fill={c.grass} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = ((((i * 130 - scroll) % 1560) + 1560) % 1560) - 140;
        return <PawPrint key={i} x={x} y={i % 2 ? 668 : 684} fill="rgba(46,63,191,0.18)" />;
      })}
    </svg>
  );
}

/** "Walks feel like a tug-of-war?" — a dog drags its owner along. */
function Problem() {
  const frame = useCurrentFrame();
  const lean = -14 + Math.sin(frame * 0.35) * 4;
  const lunge = Math.sin(frame * 0.3) * 10;
  const ox = 360 + frame * 0.8;
  const dx = 640 + frame * 0.8 + lunge;
  const ownerTop = 396;
  const dogTop = 492 + Math.abs(Math.sin(frame * 0.6)) * -10;
  // The owner's hand, rotated with the lean around their feet (28, 122), at 2x scale.
  const rad = (lean * Math.PI) / 180;
  const hx = 28 + (72 - 28) * Math.cos(rad) - (45.5 - 122) * Math.sin(rad);
  const hy = 122 + (72 - 28) * Math.sin(rad) + (45.5 - 122) * Math.cos(rad);
  const hand = { x: ox + hx * 2, y: ownerTop + hy * 2 };
  const collar = { x: dx + 70 * 2, y: dogTop + 33 * 2 };
  return (
    <AbsoluteFill>
      <Ground scroll={frame * 6} />
      <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
        <path
          d={`M${hand.x} ${hand.y} Q ${(hand.x + collar.x) / 2} ${(hand.y + collar.y) / 2 + 6} ${collar.x} ${collar.y}`}
          stroke={c.primary}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`translate(${ox} ${ownerTop}) scale(2)`}>
          <Owner lean={lean} />
        </g>
        <g transform={`translate(${dx} ${dogTop}) scale(2)`}>
          <Dog stride={Math.sin(frame * 0.6) * 32} wag={Math.sin(frame * 0.9) * 18} />
        </g>
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={dx - 30 - i * 6}
            x2={dx - 90 - i * 6 + Math.sin(frame * 0.5 + i) * 10}
            y1={dogTop + 60 + i * 18}
            y2={dogTop + 60 + i * 18}
            stroke={c.ink}
            strokeOpacity={0.25}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0 }}>
        <Headline>Walks feel like a tug-of-war?</Headline>
        <Subline at={30}>Leash pulling, barking at the gate, puppy zoomies…</Subline>
      </div>
    </AbsoluteFill>
  );
}

/** A tennis ball bounces in and becomes the Heel logo. */
function Logo() {
  const frame = useCurrentFrame();
  const drop = useSpring(0, 8);
  const slide = useSpring(24, 16);
  const ballY = (1 - drop) * -420;
  const squash = 1 + Math.max(0, Math.sin(frame * 0.5)) * 0.08 * (1 - slide);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 * slide }}>
        <svg
          width={140}
          height={140}
          viewBox="-70 -70 140 140"
          style={{
            transform: `translateY(${ballY}px) scale(${squash}, ${2 - squash}) rotate(${frame * 4}deg)`,
          }}
        >
          <TennisBall r={64} />
        </svg>
        <div
          style={{
            overflow: 'hidden',
            maxWidth: 360 * slide,
            fontFamily: heading,
            fontWeight: 800,
            fontSize: 132,
            letterSpacing: -4,
            color: c.ink,
            whiteSpace: 'nowrap',
          }}
        >
          Heel
        </div>
      </div>
      <div style={{ position: 'absolute', top: 470, left: 0, right: 0 }}>
        <Subline at={34}>Certified trainers · 1:1 video consults · from home</Subline>
      </div>
    </AbsoluteFill>
  );
}

function ScreenSlot({ children }: { children: React.ReactNode }) {
  const enter = useSpring(0, 18);
  const height = (SCREEN.width * SHOT_H) / SHOT_W + 38;
  return (
    <div
      style={{
        position: 'absolute',
        left: SCREEN.left,
        top: (720 - height) / 2,
        transform: `translateX(${(1 - enter) * 80}px) rotate(${(1 - enter) * 2}deg)`,
      }}
    >
      {children}
    </div>
  );
}

/** Cursor that travels between [frame, x, y] waypoints. */
function cursorAt(frame: number, path: [number, number, number][]) {
  return {
    x: keys(
      frame,
      path.map(([f, x]) => [f, x] as [number, number]),
    ),
    y: keys(
      frame,
      path.map(([f, , y]) => [f, y] as [number, number]),
    ),
  };
}

const press = (frame: number, at: number) =>
  keys(frame, [
    [at - 3, 0],
    [at, 1],
    [at + 5, 0],
  ]);
const ripple = (frame: number, at: number) => (frame - at) / 18;

function Find() {
  const frame = useCurrentFrame();
  const camera = {
    x: keys(frame, [
      [30, 1200],
      [75, 1918],
    ]),
    y: keys(frame, [
      [30, 750],
      [75, 1237],
    ]),
    zoom: keys(frame, [
      [30, 1],
      [75, 1.55],
    ]),
  };
  const cur = cursorAt(frame, [
    [20, 1300, 600],
    [60, 1700, 1050],
    [92, 2179, 1434],
  ]);
  return (
    <AbsoluteFill>
      <StepCopy
        step={1}
        title="Find a trainer"
        text="Filter by pet and problem. Every trainer is certified and sets their own price."
      />
      <ScreenSlot>
        <Screen
          src="screens/trainers.png"
          url="heel-pets.vercel.app/trainers"
          width={SCREEN.width}
          camera={camera}
        >
          {(k) => (
            <>
              <Highlight
                x={1532}
                y={988}
                w={772}
                h={498}
                k={k}
                t={keys(frame, [
                  [62, 0],
                  [76, 1],
                ])}
                radius={36}
              />
              <Ripple x={2179} y={1434} k={k} t={ripple(frame, 100)} />
              <Cursor x={cur.x} y={cur.y} k={k} pressed={press(frame, 100)} />
            </>
          )}
        </Screen>
      </ScreenSlot>
    </AbsoluteFill>
  );
}

function Pick() {
  const frame = useCurrentFrame();
  const camera = {
    x: keys(frame, [
      [16, 1200],
      [50, 1855],
    ]),
    y: keys(frame, [
      [16, 750],
      [50, 520],
      [72, 520],
      [100, 1150],
    ]),
    zoom: keys(frame, [
      [16, 1],
      [50, 1.7],
    ]),
  };
  const cur = cursorAt(frame, [
    [24, 1500, 700],
    [52, 2090, 420],
    [72, 2090, 420],
    [108, 1777, 1378],
  ]);
  return (
    <AbsoluteFill>
      <StepCopy
        step={2}
        title="Pick a time"
        text="Choose 30 or 60 minutes. Times always show in your own time zone."
      />
      <ScreenSlot>
        <Screen
          src="screens/trainer-picked.png"
          url="heel-pets.vercel.app/trainers/sam-villanueva"
          width={SCREEN.width}
          camera={camera}
        >
          {(k) => (
            <>
              <Highlight
                x={1866}
                y={332}
                w={276}
                h={104}
                k={k}
                t={keys(frame, [
                  [54, 0],
                  [64, 1],
                  [96, 1],
                  [104, 0],
                ])}
                radius={30}
              />
              <Highlight
                x={1712}
                y={1356}
                w={130}
                h={43}
                k={k}
                t={keys(frame, [
                  [112, 0],
                  [122, 1],
                ])}
                radius={26}
              />
              <Ripple x={2090} y={420} k={k} t={ripple(frame, 58)} />
              <Ripple x={1777} y={1378} k={k} t={ripple(frame, 112)} />
              <Cursor
                x={cur.x}
                y={cur.y}
                k={k}
                pressed={Math.max(press(frame, 58), press(frame, 112))}
              />
            </>
          )}
        </Screen>
      </ScreenSlot>
    </AbsoluteFill>
  );
}

function Pay() {
  const frame = useCurrentFrame();
  const paid = keys(frame, [
    [90, 0],
    [102, 1],
  ]);
  const camera = {
    x: 1200,
    y: keys(frame, [
      [10, 750],
      [40, 880],
      [92, 880],
      [112, 520],
    ]),
    zoom: keys(frame, [
      [10, 1],
      [40, 1.45],
      [92, 1.45],
      [112, 1.25],
    ]),
  };
  const cur = cursorAt(frame, [
    [30, 1700, 1250],
    [76, 1200, 1021],
  ]);
  const left = 599 - Math.floor(frame / FPS);
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return (
    <AbsoluteFill>
      <StepCopy
        step={3}
        title="Hold and pay"
        text="Your time is held for 10 minutes while you pay. Cancel early for a full refund."
      />
      <ScreenSlot>
        <Screen
          src="screens/checkout.png"
          url="heel-pets.vercel.app/bookings/…"
          width={SCREEN.width}
          camera={camera}
        >
          {(k) => (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 1126,
                  top: 744,
                  width: 64,
                  paddingLeft: 12,
                  height: 44,
                  background: '#f1fac4',
                  color: '#3e4a00',
                  fontFamily: body,
                  fontWeight: 500,
                  fontSize: 32,
                  lineHeight: '44px',
                }}
              >
                {clock}
              </div>
              <Ripple x={1200} y={1021} k={k} t={ripple(frame, 82)} />
              {paid < 1 && <Cursor x={cur.x} y={cur.y} k={k} pressed={press(frame, 82)} />}
              <Img
                src={staticFile('screens/booked.png')}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: SHOT_W,
                  height: SHOT_H,
                  opacity: paid,
                }}
              />
            </>
          )}
        </Screen>
        <Confetti at={94} />
      </ScreenSlot>
    </AbsoluteFill>
  );
}

function Confetti({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const t = (frame - at) / 40;
  if (t <= 0 || t >= 1) return null;
  const colors = [c.ball, c.pop, c.primary, '#4bb3e0'];
  return (
    <svg
      width={740}
      height={500}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
    >
      {Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const dist = 120 + (i % 5) * 40;
        const x = 370 + Math.cos(angle) * dist * t;
        const y = 150 + Math.sin(angle) * dist * t + 160 * t * t;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={10}
            height={16}
            rx={3}
            fill={colors[i % colors.length]}
            opacity={1 - t}
            transform={`rotate(${i * 40 + t * 360} ${x + 5} ${y + 8})`}
          />
        );
      })}
    </svg>
  );
}

/** A 1:1 video call: the trainer waves, the owner's dog wags in the corner. */
function Meet() {
  const frame = useCurrentFrame();
  const bubble = useSpring(34, 12);
  const secs = 12 * 60 + 40 + Math.floor(frame / FPS);
  const width = SCREEN.width;
  const height = (width * SHOT_H) / SHOT_W + 38;
  return (
    <AbsoluteFill>
      <StepCopy
        step={4}
        title="Meet on video"
        text="A 1:1 consult from home, so the trainer sees the problem where it happens."
      />
      <ScreenSlot>
        <div
          style={{
            position: 'relative',
            width,
            height,
            borderRadius: 22,
            overflow: 'hidden',
            background: c.ink,
            boxShadow: '0 30px 60px -20px rgba(23,26,61,0.45)',
          }}
        >
          <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="room" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#e6e9ff" />
                <stop offset="1" stopColor="#cfd5ff" />
              </linearGradient>
            </defs>
            <rect x={12} y={12} width={width - 24} height={height - 24} rx={16} fill="url(#room)" />
            <rect x={70} y={70} width={150} height={110} rx={10} fill="#ffffff" opacity={0.7} />
            <rect x={520} y={60} width={120} height={160} rx={10} fill={c.ball} opacity={0.35} />
            <g transform={`translate(${width / 2 - 84} ${height - 380}) scale(3)`}>
              <Trainer arm={70 + Math.sin(frame * 0.45) * 22} treat={false} />
            </g>
          </svg>
          <div
            style={{
              position: 'absolute',
              left: 28,
              top: 26,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(23,26,61,0.75)',
              color: '#fff',
              fontSize: 17,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: '#ff5b5b',
                opacity: frame % 30 < 20 ? 1 : 0.3,
              }}
            />
            Sam Villanueva · {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </div>
          <div
            style={{
              position: 'absolute',
              left: width / 2 + 70,
              top: 92,
              padding: '14px 20px',
              borderRadius: 22,
              background: '#fff',
              fontFamily: heading,
              fontWeight: 700,
              fontSize: 24,
              color: c.ink,
              boxShadow: '0 10px 24px -10px rgba(23,26,61,0.4)',
              transform: `scale(${bubble})`,
              transformOrigin: '0% 100%',
            }}
          >
            Let&apos;s try a loose-leash game!
          </div>
          <div
            style={{
              position: 'absolute',
              right: 26,
              bottom: 86,
              width: 210,
              height: 140,
              borderRadius: 14,
              overflow: 'hidden',
              border: '3px solid #fff',
              background: '#fdeff4',
            }}
          >
            <svg width={210} height={140}>
              <rect y={112} width={210} height={28} fill={c.grassLight} />
              <g transform="translate(10 8)">
                <Owner />
              </g>
              <g transform="translate(86 50) scale(0.95)">
                <Dog wag={Math.sin(frame * 0.9) * 22} />
              </g>
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 22,
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            {['#3a3f6e', '#3a3f6e', '#e5484d'].map((bg, i) => (
              <span
                key={i}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CallIcon kind={i} />
              </span>
            ))}
          </div>
        </div>
      </ScreenSlot>
    </AbsoluteFill>
  );
}

function CallIcon({ kind }: { kind: number }) {
  const common = { stroke: '#fff', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <svg width={24} height={24} viewBox="0 0 24 24">
      {kind === 0 && (
        <>
          <rect x={9} y={3} width={6} height={12} rx={3} {...common} />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" {...common} />
        </>
      )}
      {kind === 1 && (
        <>
          <rect x={3} y={6} width={13} height={12} rx={2} {...common} />
          <path d="M16 10l5-3v10l-5-3" {...common} />
        </>
      )}
      {kind === 2 && <path d="M3 14c5-5 13-5 18 0l-2 3-4-1v-3c-2-1-4-1-6 0v3l-4 1z" fill="#fff" />}
    </svg>
  );
}

const PLAN_STEPS: [number, number][] = [
  [811, 87],
  [914, 126],
  [1058, 87],
  [1163, 86],
];

function Plan() {
  const frame = useCurrentFrame();
  const camera = {
    x: 1200,
    y: keys(frame, [
      [10, 750],
      [40, 1000],
    ]),
    zoom: keys(frame, [
      [10, 1],
      [40, 1.4],
    ]),
  };
  return (
    <AbsoluteFill>
      <StepCopy
        step={5}
        title="Get a plan"
        text="Your trainer sends a step-by-step plan to practise a few minutes a day."
      />
      <ScreenSlot>
        <Screen
          src="screens/plan.png"
          url="heel-pets.vercel.app/bookings/…"
          width={SCREEN.width}
          camera={camera}
        >
          {(k) =>
            PLAN_STEPS.map(([y, h], i) => {
              const t = keys(frame, [
                [44 + i * 16, 0],
                [54 + i * 16, 1],
              ]);
              // Only the newest step is ringed; earlier ones keep their check mark.
              const ring = keys(frame, [
                [44 + i * 16, 0],
                [54 + i * 16, 1],
                [60 + i * 16, 1],
                [70 + i * 16, 0],
              ]);
              return (
                <div key={i}>
                  <Highlight x={704} y={y} w={992} h={h} k={k} t={ring} radius={34} />
                  <svg
                    width={56}
                    height={56}
                    viewBox="0 0 56 56"
                    style={{
                      position: 'absolute',
                      left: 1620,
                      top: y + h / 2 - 28,
                      transform: `scale(${t})`,
                    }}
                  >
                    <circle cx={28} cy={28} r={26} fill={c.ball} />
                    <path
                      d="M16 29l8 8 16-17"
                      stroke={c.ink}
                      strokeWidth={5}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              );
            })
          }
        </Screen>
        <Hearts at={110} />
      </ScreenSlot>
    </AbsoluteFill>
  );
}

function Hearts({ at }: { at: number }) {
  const frame = useCurrentFrame();
  return (
    <svg
      width={740}
      height={500}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const t = (frame - at - i * 5) / 36;
        if (t <= 0 || t >= 1) return null;
        const x = 520 + i * 38 + Math.sin(t * 6 + i) * 10;
        const y = 440 - t * 260;
        return (
          <path
            key={i}
            transform={`translate(${x} ${y}) scale(${1.6 + (i % 2) * 0.6})`}
            d="M0 0 c -6 -8 -16 -2 -10 6 l 10 9 l 10 -9 c 6 -8 -4 -14 -10 -6 z"
            fill={c.pop}
            opacity={1 - t}
          />
        );
      })}
    </svg>
  );
}

/** The dog clears a hurdle for a treat, then the call to action. */
function Outro() {
  const frame = useCurrentFrame();
  const run = keys(frame, [
    [0, 0],
    [48, 1],
  ]);
  const dogX = 120 + run * 640;
  const jump = run > 0.38 && run < 0.72 ? Math.sin(((run - 0.38) / 0.34) * Math.PI) * 120 : 0;
  const running = run < 1;
  const card = useSpring(46, 15);
  return (
    <AbsoluteFill>
      <Ground />
      <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="stripes" width="24" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill={c.primary} />
            <rect x="12" width="12" height="12" fill="#fff" />
          </pattern>
        </defs>
        <g transform="translate(470 470)">
          <rect x={0} y={0} width={10} height={130} rx={4} fill="#7a4310" />
          <rect x={92} y={0} width={10} height={130} rx={4} fill="#7a4310" />
          <rect x={-8} y={12} width={118} height={16} rx={8} fill="url(#stripes)" />
        </g>
        <g transform="translate(990 396) scale(2)">
          <Trainer arm={run >= 1 ? 26 : 50} />
        </g>
        <g
          transform={`translate(${dogX} ${492 - jump}) scale(2) rotate(${jump ? (run < 0.55 ? -12 : 10) : 0} 50 40)`}
        >
          <Dog stride={running ? Math.sin(frame * 0.7) * 34 : 0} wag={Math.sin(frame * 0.9) * 20} />
        </g>
        <g transform="translate(60 560) scale(1.1)">
          <Cat tail={Math.sin(frame * 0.2) * 10} />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 92,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: card,
          transform: `translateY(${(1 - card) * 30}px)`,
        }}
      >
        <div
          style={{
            fontFamily: heading,
            fontWeight: 800,
            fontSize: 62,
            letterSpacing: -1.5,
            color: c.ink,
          }}
        >
          Small wins, every week.
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span
            style={{
              padding: '14px 26px',
              borderRadius: 999,
              background: c.primary,
              color: '#fff',
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Find a trainer
          </span>
          <span style={{ fontSize: 24, color: c.muted }}>heel-pets.vercel.app</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

const scenes: Record<keyof typeof T, () => React.JSX.Element> = {
  problem: Problem,
  logo: Logo,
  find: Find,
  pick: Pick,
  pay: Pay,
  meet: Meet,
  plan: Plan,
  outro: Outro,
};

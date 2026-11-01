import type { ReactNode } from 'react';
import {
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { body, c, heading } from './theme';

// Screens are captured at 2400 × 1500 (1200 × 750 at 2x).
export const SHOT_W = 2400;
export const SHOT_H = 1500;

const ease = Easing.bezier(0.33, 0, 0.2, 1);

/** Interpolates between keyframes [frame, value] with a smooth ease, clamped at both ends. */
export function keys(frame: number, points: [number, number][]) {
  return interpolate(
    frame,
    points.map((p) => p[0]),
    points.map((p) => p[1]),
    { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
}

export function useSpring(delay: number, damping = 14) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
}

/** Fades and lifts a scene in at the start and out at the end of its sequence. */
export function SceneFade({ length, children }: { length: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = keys(frame, [
    [0, 0],
    [10, 1],
    [length - 10, 1],
    [length, 0],
  ]);
  const y = keys(frame, [
    [0, 24],
    [14, 0],
  ]);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transform: `translateY(${y}px)` }}>
      {children}
    </div>
  );
}

type Camera = { x: number; y: number; zoom: number };

/**
 * A browser window showing a captured screen. The camera zooms toward (x, y) in screenshot
 * pixels; `children` are overlays positioned in the same screenshot pixels.
 */
export function Screen({
  src,
  url,
  width,
  camera,
  children,
}: {
  src: string;
  url: string;
  width: number;
  camera: Camera;
  children?: (k: number) => ReactNode;
}) {
  const height = (width * SHOT_H) / SHOT_W;
  const k = (width / SHOT_W) * camera.zoom;
  const tx = Math.min(0, Math.max(width - SHOT_W * k, width / 2 - camera.x * k));
  const ty = Math.min(0, Math.max(height - SHOT_H * k, height / 2 - camera.y * k));
  return (
    <div
      style={{
        width,
        borderRadius: 18,
        overflow: 'hidden',
        background: c.card,
        boxShadow: '0 30px 60px -20px rgba(23,26,61,0.35), 0 0 0 1px rgba(23,26,61,0.06)',
      }}
    >
      <div
        style={{
          height: 38,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 16px',
          background: '#eceef8',
        }}
      >
        {['#ff6f6f', '#ffc94d', '#58cf78'].map((dot) => (
          <span key={dot} style={{ width: 11, height: 11, borderRadius: 6, background: dot }} />
        ))}
        <div
          style={{
            marginLeft: 16,
            flex: 1,
            height: 24,
            borderRadius: 12,
            background: c.card,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            fontFamily: body,
            fontSize: 13,
            color: c.muted,
          }}
        >
          🔒&nbsp;{url}
        </div>
      </div>
      <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            width: SHOT_W,
            height: SHOT_H,
            transformOrigin: '0 0',
            transform: `translate(${tx}px, ${ty}px) scale(${k})`,
          }}
        >
          <Img src={staticFile(src)} style={{ width: SHOT_W, height: SHOT_H }} />
          {children?.(k)}
        </div>
      </div>
    </div>
  );
}

/** A mouse pointer at (x, y) in screenshot pixels, drawn at a constant on-screen size. */
export function Cursor({
  x,
  y,
  k,
  pressed = 0,
}: {
  x: number;
  y: number;
  k: number;
  pressed?: number;
}) {
  const size = 30 / k;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{
        position: 'absolute',
        left: x - size * 0.18,
        top: y - size * 0.08,
        transform: `scale(${1 - pressed * 0.15})`,
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
      }}
    >
      <path
        d="M4 2 L 4 19 L 8.5 14.8 L 11.6 21.5 L 14.4 20.3 L 11.4 13.8 L 17.6 13.6 Z"
        fill="#fff"
        stroke={c.ink}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** An expanding ring where a click lands. `t` runs 0 → 1. */
export function Ripple({ x, y, k, t }: { x: number; y: number; k: number; t: number }) {
  if (t <= 0 || t >= 1) return null;
  const r = (12 + t * 38) / k;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        border: `${4 / k}px solid ${c.primary}`,
        opacity: 1 - t,
      }}
    />
  );
}

/** A soft highlight box around a region of the screenshot. */
export function Highlight({
  x,
  y,
  w,
  h,
  k,
  t,
  radius = 28,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  k: number;
  t: number;
  radius?: number;
}) {
  const pad = 10 / k;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - pad,
        top: y - pad,
        width: w + pad * 2,
        height: h + pad * 2,
        borderRadius: radius,
        border: `${5 / k}px solid ${c.pop}`,
        boxShadow: `0 0 0 ${12 / k}px rgba(210,60,116,0.15)`,
        opacity: t,
        transform: `scale(${0.96 + 0.04 * t})`,
      }}
    />
  );
}

/** Left-hand copy for a step: number badge, title and a short line. */
export function StepCopy({ step, title, text }: { step: number; title: string; text: string }) {
  const frame = useCurrentFrame();
  const badge = useSpring(4);
  const titleIn = keys(frame, [
    [8, 0],
    [22, 1],
  ]);
  const textIn = keys(frame, [
    [16, 0],
    [30, 1],
  ]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        top: 0,
        bottom: 0,
        width: 360,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: c.ball,
          color: c.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: heading,
          fontWeight: 800,
          fontSize: 32,
          transform: `scale(${badge}) rotate(${(1 - badge) * -90}deg)`,
        }}
      >
        {step}
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: heading,
          fontWeight: 800,
          fontSize: 60,
          lineHeight: 1.02,
          letterSpacing: -1.5,
          color: c.ink,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: body,
          fontSize: 25,
          lineHeight: 1.4,
          color: c.muted,
          opacity: textIn,
          transform: `translateY(${(1 - textIn) * 16}px)`,
        }}
      >
        {text}
      </div>
      <Progress step={step} />
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div style={{ marginTop: 36, display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: i === step ? 34 : 10,
            height: 10,
            borderRadius: 5,
            background: i <= step ? c.primary : c.border,
          }}
        />
      ))}
    </div>
  );
}

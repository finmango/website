import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Easing,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { PAPER, INK, ORANGE, HAIRLINE, SANS, MONO } from './design';

/* ------------------------------------------------------------------ */
/** Piecewise keyframe sampler with smooth easing between stops. */
export const sampleKeys = (
  t: number,
  keys: Array<{ t: number } & Record<string, number>>,
  prop: string,
): number => {
  const ts = keys.map((k) => k.t);
  const vs = keys.map((k) => k[prop] as number);
  return interpolate(t, ts, vs, {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

/** Camera-style punch-in: keep source point (cx,cy) centered at scale s. */
export const punchTransform = (s: number, cx: number, cy: number): string => {
  const half = 1 / (2 * s);
  const ccx = Math.min(Math.max(cx, half), 1 - half);
  const ccy = Math.min(Math.max(cy, half), 1 - half);
  return `scale(${s}) translate(${(0.5 - ccx) * 100}%, ${(0.5 - ccy) * 100}%)`;
};

/* ------------------------------------------------------------------ */
type KB = { from: number; to: number; cx: number; cy: number; panX: number };

/** Slow Ken Burns over a still. Progress p in 0..1 across the clip. */
export const KenBurnsImage: React.FC<{ src: string; kb: KB; p: number }> = ({ src, kb, p }) => {
  const e = interpolate(p, [0, 1], [0, 1], { easing: Easing.inOut(Easing.quad) });
  const s = kb.from + (kb.to - kb.from) * e;
  const cx = kb.cx + kb.panX * (e - 0.5) * 2;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: INK }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: punchTransform(s, cx, kb.cy),
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/** Thin editorial lower-third label for screen recordings. */
export const RecordingLabel: React.FC<{ text: string; appearFrame?: number; outAt?: number }> = ({
  text,
  appearFrame = 12,
  outAt = 4.2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = interpolate(
    frame,
    [appearFrame, appearFrame + 0.35 * fps, outAt * fps, (outAt + 0.4) * fps],
    [0, 1, 1, 0],
    { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (a <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 56, /* captions own the bottom band */
        display: 'flex',
        alignItems: 'stretch',
        opacity: a,
        transform: `translateX(${(1 - a) * -24}px)`,
      }}
    >
      <div style={{ width: 4, background: ORANGE }} />
      <div
        style={{
          background: PAPER,
          borderTop: `1px solid ${HAIRLINE}`,
          borderBottom: `1px solid ${HAIRLINE}`,
          borderRight: `1px solid ${HAIRLINE}`,
          padding: '12px 22px 11px',
          fontFamily: MONO,
          fontSize: 19,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: INK,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/** Segment-1 name card: in at 3s, out by 8s. */
export const NameCard: React.FC<{ inAt: number; outAt: number }> = ({ inAt, outAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const a = interpolate(
    t,
    [inAt, inAt + 0.4, outAt - 0.35, outAt],
    [0, 1, 1, 0],
    { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (a <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        bottom: 88,
        opacity: a,
        transform: `translateX(${(1 - a) * -28}px)`,
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <div style={{ width: 4, background: ORANGE }} />
      <div
        style={{
          background: 'rgba(250, 247, 242, 0.96)',
          borderTop: `1px solid ${HAIRLINE}`,
          borderBottom: `1px solid ${HAIRLINE}`,
          borderRight: `1px solid ${HAIRLINE}`,
          padding: '16px 26px 15px',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: INK,
          }}
        >
          Scott Glasgow
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 400,
            fontSize: 17,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: INK,
            opacity: 0.75,
            marginTop: 6,
          }}
        >
          Founder, FinMango
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
type Stat = {
  at: number;
  until: number;
  number?: number;
  suffix?: string;
  text?: string;
  label?: string;
  labelAbove?: string;
  logo?: string; // partner lockup, shown on a white plate above the text
  countUp: boolean;
};

/** Animated stat card: settles fast, holds, fades. */
export const StatCard: React.FC<{ stat: Stat; segT: number }> = ({ stat, segT }) => {
  const a = interpolate(
    segT,
    [stat.at, stat.at + 0.3, stat.until - 0.3, stat.until],
    [0, 1, 1, 0],
    { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (a <= 0.001) return null;
  const settle = interpolate(segT, [stat.at, stat.at + 0.45], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  let big: string;
  if (stat.countUp && typeof stat.number === 'number') {
    const n = Math.round(stat.number * (0.35 + 0.65 * settle));
    big = n.toLocaleString('en-US') + (settle >= 1 ? stat.suffix ?? '' : '');
  } else {
    big = stat.text ?? '';
  }
  const isText = !stat.countUp;
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        bottom: 250,
        opacity: a,
        transform: `translateY(${(1 - a) * 16}px)`,
      }}
    >
      <div
        style={{
          background: 'rgba(250, 247, 242, 0.97)',
          padding: '22px 30px 20px',
          borderLeft: `4px solid ${ORANGE}`,
          maxWidth: 760,
        }}
      >
        <div style={{ height: 1, background: HAIRLINE, marginBottom: 14 }} />
        {stat.logo ? (
          <div
            style={{
              background: '#FFFFFF',
              border: `1px solid ${HAIRLINE}`,
              padding: '10px 18px',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            <Img src={stat.logo} style={{ height: 58, display: 'block' }} />
          </div>
        ) : null}
        {stat.labelAbove ? (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 21,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: INK,
              marginBottom: 10,
              opacity: 0.85,
            }}
          >
            {stat.labelAbove}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: isText ? 48 : 92,
            lineHeight: 1.04,
            color: ORANGE,
            letterSpacing: isText ? '-0.01em' : '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {big}
        </div>
        {stat.label ? (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 21,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: INK,
              marginTop: 10,
              opacity: 0.85,
            }}
          >
            {stat.label}
          </div>
        ) : null}
        <div style={{ height: 1, background: HAIRLINE, marginTop: 14 }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
type Cap = { t0: number; t1: number; text: string };

/** Burned-in captions, bottom-center; raised while the name card shows. */
export const Captions: React.FC<{
  caps: Cap[];
  segT: number;
  raiseWindow?: [number, number] | null;
}> = ({ caps, segT, raiseWindow }) => {
  const active = caps.find((c) => segT >= c.t0 && segT < c.t1);
  if (!active) return null;
  const raised = raiseWindow && segT >= raiseWindow[0] - 0.2 && segT <= raiseWindow[1] + 0.2;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: raised ? 254 : 84,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#FFFFFF',
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 38,
          lineHeight: 1.32,
          padding: '10px 26px 12px',
          maxWidth: 1240,
          textAlign: 'center',
          borderRadius: 4,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/** Labelled stand-in for camera footage that hasn't been delivered yet. */
export const PlaceholderCamera: React.FC<{
  title: string;
  detail: string;
  photo: string;
}> = ({ title, detail, photo }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = frame / Math.max(durationInFrames - 1, 1);
  return (
    <AbsoluteFill style={{ background: PAPER, flexDirection: 'row' }}>
      <div style={{ width: '44%', height: '100%', overflow: 'hidden' }}>
        <Img
          src={photo}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1.02 + 0.04 * p})`,
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: ORANGE,
            marginBottom: 22,
          }}
        >
          {title}
        </div>
        <div style={{ height: 1, background: HAIRLINE, marginBottom: 26 }} />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 1.12,
            color: INK,
            marginBottom: 26,
          }}
        >
          Scott on camera
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 19,
            letterSpacing: '0.08em',
            color: INK,
            opacity: 0.7,
            lineHeight: 1.7,
          }}
        >
          {detail}
        </div>
        <div style={{ height: 1, background: HAIRLINE, marginTop: 26 }} />
      </div>
    </AbsoluteFill>
  );
};

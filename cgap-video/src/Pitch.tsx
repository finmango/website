import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import timeline from './timeline.json';
import { ensureFonts } from './fonts';
import { INK } from './design';
import {
  Captions,
  KenBurnsImage,
  NameCard,
  PlaceholderCamera,
  RecordingLabel,
  StatCard,
  punchTransform,
  sampleKeys,
} from './components';

const T = timeline;
const XFADE = T.crossfade; // 0.3s audio crossfades at segment boundaries
const BED_GAIN = Math.pow(10, T.music.bedDb / 20);

const speechRamp = (t: number, dur: number) =>
  interpolate(t, [0, XFADE, dur - XFADE, dur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/* ------------------------------------------------------------------ */
const CameraSegment: React.FC<{
  src: string | null;
  dur: number;
  placeholderTitle: string;
  placeholderDetail: string;
}> = ({ src, dur, placeholderTitle, placeholderDetail }) => {
  const { fps } = useVideoConfig();
  if (!src) {
    return (
      <PlaceholderCamera
        title={placeholderTitle}
        detail={placeholderDetail}
        photo={staticFile('photos/scott-placeholder.jpeg')}
      />
    );
  }
  return (
    <AbsoluteFill style={{ background: INK }}>
      <OffthreadVideo
        src={staticFile(src)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        volume={(f) => speechRamp(f / fps, dur)}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
const Recording: React.FC<{
  src: string;
  punch: Array<{ t: number; s: number; cx: number; cy: number }>;
  label: string;
}> = ({ src, punch, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = sampleKeys(t, punch, 's');
  const cx = sampleKeys(t, punch, 'cx');
  const cy = sampleKeys(t, punch, 'cy');
  return (
    <AbsoluteFill style={{ background: '#FAF7F2', overflow: 'hidden' }}>
      <OffthreadVideo
        muted
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          transform: punchTransform(s, cx, cy),
        }}
      />
      <RecordingLabel text={label} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const segT = frame / fps;
  const DISSOLVE = 0.25;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {T.montage.clips.map((c, i) => {
        const t0 = i === 0 ? c.t0 : c.t0 - DISSOLVE / 2;
        const t1 = i === T.montage.clips.length - 1 ? c.t1 : c.t1 + DISSOLVE / 2;
        if (segT < t0 || segT > t1) return null;
        const opacity = interpolate(
          segT,
          [t0, t0 + (i === 0 ? 0.001 : DISSOLVE), t1 - (i === T.montage.clips.length - 1 ? 0.001 : DISSOLVE), t1],
          [i === 0 ? 1 : 0, 1, 1, i === T.montage.clips.length - 1 ? 1 : 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        const p = Math.min(Math.max((segT - c.t0) / (c.t1 - c.t0), 0), 1);
        return (
          <AbsoluteFill key={c.src + i} style={{ opacity }}>
            <KenBurnsImage src={staticFile(c.src)} kb={c.kb} p={p} />
          </AbsoluteFill>
        );
      })}
      {T.montage.stats.map((s, i) => (
        <StatCard key={i} stat={s} segT={segT} />
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
const MusicBed: React.FC = () => {
  const { fps } = useVideoConfig();
  const start = T.music.start;
  const relFadeOutEnd = T.music.fadeOutEnd - start;
  return (
    <Sequence from={Math.round(start * fps)} name="music">
      <Audio
        src={staticFile(T.music.src)}
        volume={(f) => {
          const t = f / fps;
          return interpolate(
            t,
            [0, T.music.fadeIn, relFadeOutEnd - T.music.fadeOut, relFadeOutEnd],
            [0, BED_GAIN, BED_GAIN, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
        }}
      />
    </Sequence>
  );
};

/* ------------------------------------------------------------------ */
export const Pitch: React.FC = () => {
  ensureFonts();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const F = (sec: number) => Math.round(sec * fps);
  const { s1, s2, s3, s4 } = T.segments;
  const housing = T.recordings.housing;
  const ira = T.recordings.ira;

  return (
    <AbsoluteFill style={{ background: INK }}>
      {/* ---- segment 1: camera open ---- */}
      <Sequence from={0} durationInFrames={F(s1.dur)} name="s1-camera-open">
        <CameraSegment
          src={T.prepared.cam1 ?? null}
          dur={s1.dur}
          placeholderTitle="Segment 01 — Camera Open"
          placeholderDetail={'waiting for assets/camera-open.mp4 — planned :15. Lower-third name card previews at 0:03.'}
        />
        <SegmentCaptions seg="s1" raise />
        <NameCard inAt={T.nameCard.in} outAt={T.nameCard.out} />
      </Sequence>

      {/* ---- segment 2: calculator recordings ---- */}
      <Sequence from={F(s2.start)} durationInFrames={F(s2.dur)} name="s2-calculators">
        <Sequence from={0} durationInFrames={F(housing.slot)} name="housing">
          <Recording
            src={housing.src}
            punch={housing.punch}
            label="finmango.org — Housing Affordability Calculator"
          />
        </Sequence>
        <Sequence from={F(housing.slot)} durationInFrames={F(ira.slot)} name="ira">
          <Recording src={ira.src} punch={ira.punch} label="finmango.org — Battle of the IRAs" />
        </Sequence>
        {T.prepared.vo2 ? (
          <Audio src={staticFile(T.prepared.vo2)} volume={(f) => speechRamp(f / fps, s2.dur)} />
        ) : null}
        <SegmentCaptions seg="s2" />
      </Sequence>

      {/* ---- segment 3: montage + stats ---- */}
      <Sequence from={F(s3.start)} durationInFrames={F(s3.dur)} name="s3-montage">
        <Montage />
        {T.prepared.vo3 ? (
          <Audio src={staticFile(T.prepared.vo3)} volume={(f) => speechRamp(f / fps, s3.dur)} />
        ) : null}
        <SegmentCaptions seg="s3" />
      </Sequence>

      {/* ---- segment 4: camera close (clean voice, no music) ---- */}
      <Sequence from={F(s4.start)} durationInFrames={F(s4.dur)} name="s4-camera-close">
        <CameraSegment
          src={T.prepared.cam2 ?? null}
          dur={s4.dur}
          placeholderTitle="Segment 04 — Camera Close"
          placeholderDetail={'waiting for assets/camera-close.mp4 — planned :30. Music is fully out before this segment.'}
        />
        <SegmentCaptions seg="s4" />
      </Sequence>

      <MusicBed />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
const SegmentCaptions: React.FC<{ seg: 's1' | 's2' | 's3' | 's4'; raise?: boolean }> = ({
  seg,
  raise,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const segT = frame / fps;
  // REMOTION_NO_CAPTIONS=1 renders clean picture for external editors (Canva
  // handoff) — captions are burned in only on the full deliverable
  if (process.env.REMOTION_NO_CAPTIONS === '1') return null;
  return (
    <Captions
      caps={T.captions[seg]}
      segT={segT}
      raiseWindow={raise ? [T.nameCard.in, T.nameCard.out] : null}
    />
  );
};

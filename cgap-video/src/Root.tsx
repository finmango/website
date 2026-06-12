import React from 'react';
import { Composition } from 'remotion';
import { Pitch } from './Pitch';
import timeline from './timeline.json';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Pitch"
      component={Pitch}
      durationInFrames={Math.round(timeline.total * timeline.fps)}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
    />
  );
};

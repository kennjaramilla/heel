import { Composition } from 'remotion';
import { DURATION, FPS, HowItWorks } from './HowItWorks';

export function Root() {
  return (
    <Composition
      id="HowItWorks"
      component={HowItWorks}
      durationInFrames={DURATION}
      fps={FPS}
      width={1280}
      height={720}
    />
  );
}

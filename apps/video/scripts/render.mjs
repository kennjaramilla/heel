// Renders the explainer into the web app's public folder: an H.264 MP4 (plays everywhere) and a poster.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const out = '../web/public/video';
mkdirSync(out, { recursive: true });
const remotion = (...args) =>
  execFileSync('npx', ['remotion', ...args, '--log=error'], { stdio: 'inherit' });

remotion(
  'render',
  'src/index.ts',
  'HowItWorks',
  `${out}/how-it-works.mp4`,
  '--codec=h264',
  '--crf=30',
  '--muted',
  '--pixel-format=yuv420p',
);
remotion(
  'still',
  'src/index.ts',
  'HowItWorks',
  `${out}/how-it-works-poster.jpg`,
  '--frame=250',
  '--image-format=jpeg',
  '--jpeg-quality=80',
);

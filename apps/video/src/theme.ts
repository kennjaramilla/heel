import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadFigtree } from '@remotion/google-fonts/Figtree';

export const heading = loadBricolage('normal', {
  weights: ['700', '800'],
  subsets: ['latin'],
}).fontFamily;
export const body = loadFigtree('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin'],
}).fontFamily;

// Same tokens as apps/web globals.css.
export const c = {
  bg: '#f5f6fb',
  ink: '#171a3d',
  muted: '#565b80',
  primary: '#2e3fbf',
  secondary: '#e6e9ff',
  ball: '#d4ee3f',
  pop: '#d23c74',
  border: '#dfe2f1',
  card: '#ffffff',
  grass: '#b5d98f',
  grassLight: '#cfe8b0',
  sky: '#dfe5ff',
};

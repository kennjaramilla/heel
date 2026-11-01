# Heel explainer video

The 32-second "How it works" video on the home page, written in [Remotion](https://www.remotion.dev) (React → MP4).

- `pnpm --filter @heel/video studio`: preview and scrub in the browser
- `pnpm --filter @heel/video render`: writes `apps/web/public/video/how-it-works.mp4` and its poster

`public/screens/*.png` are real screens captured from a local build with Playwright (1200 × 750 at 2x).
Re-capture them after UI changes, then re-render.

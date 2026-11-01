'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The 32-second explainer. Loads nothing until it scrolls near the viewport, plays only while
 * visible, and never autoplays for people who prefer reduced motion.
 */
export function HowItWorksVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!userPaused.current && !reducedMotion()) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    userPaused.current = !video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <figure className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/10">
      <video
        ref={ref}
        className="block aspect-video w-full"
        poster="/video/how-it-works-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        aria-describedby="how-it-works-video-text"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/video/how-it-works.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 bottom-3 flex size-11 items-center justify-center gap-2 rounded-full bg-foreground/80 text-sm font-medium text-background backdrop-blur transition hover:bg-foreground sm:right-4 sm:bottom-4 sm:w-auto sm:px-4"
      >
        {playing ? (
          <Pause className="size-4" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
        <span className="sr-only sm:not-sr-only">{playing ? 'Pause video' : 'Play video'}</span>
      </button>
      <figcaption id="how-it-works-video-text" className="sr-only">
        A 32-second walkthrough. An owner finds a certified trainer, picks a 60-minute slot, pays
        while the time is held for 10 minutes, meets the trainer on video, and receives a
        step-by-step training plan.
      </figcaption>
    </figure>
  );
}

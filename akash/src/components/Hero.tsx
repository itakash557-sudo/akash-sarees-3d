import { useState, useEffect, useRef } from 'react';
import { site } from '../config/site';
import { scrollToId } from '../lib/hooks';
import { useStore } from '../lib/store';
import { IconArrow, IconPlay } from './icons';

const FPS = 24;
const FRAMES = 159;

export function Hero({ ready: _ready }: { ready?: boolean }) {
  const { setFilter } = useStore();
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const posterRef = useRef<HTMLImageElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [scrollProg, setScrollProg] = useState(0);

  const seekingRef = useRef(false);
  const pendingFrameRef = useRef<number | null>(null);
  const shownFrameRef = useRef(-1);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);

  // Paint the current video frame or poster image onto the canvas with high fidelity
  const paint = (source?: HTMLVideoElement | HTMLImageElement) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const media = source || videoRef.current || posterRef.current;
    if (!media) return;
    if ('readyState' in media && media.readyState < 2 && posterRef.current) {
      paint(posterRef.current);
      return;
    }
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cw = cv.width;
    const ch = cv.height;
    const vw = ('videoWidth' in media ? media.videoWidth : media.naturalWidth) || 1280;
    const vh = ('videoHeight' in media ? media.videoHeight : media.naturalHeight) || 720;
    const s = Math.max(cw / vw, ch / vh);
    const w = vw * s;
    const h = vh * s;
    ctx.drawImage(media, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  const seek = (frame: number) => {
    const v = videoRef.current;
    if (!v) return;
    if (seekingRef.current) {
      pendingFrameRef.current = frame;
      return;
    }
    if (frame === shownFrameRef.current) return;
    seekingRef.current = true;
    shownFrameRef.current = frame;

    const dur = v.duration || (FRAMES / FPS);
    const targetTime = Math.max(0, Math.min(dur - 0.02, (frame + 0.5) / FPS));
    v.currentTime = targetTime;
  };

  // Resize canvas to physical pixels matching device pixel ratio without blurry oversampling
  const handleResize = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    paint();
  };

  // Initialize poster instantly, then stream video natively without blocking UI
  useEffect(() => {
    let unmounted = false;

    // 1. Immediately paint lightweight 15KB poster so canvas is NEVER blank/black
    const poster = new Image();
    poster.src = 'images/hero-poster.webp';
    posterRef.current = poster;
    poster.onload = () => {
      if (unmounted) return;
      handleResize();
      paint(poster);
    };

    // 2. Stream video natively via browser HTTP range requests (zero load delay)
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    videoRef.current = video;

    const onSeeked = () => {
      paint(video);
      seekingRef.current = false;
      if (pendingFrameRef.current !== null) {
        const next = pendingFrameRef.current;
        pendingFrameRef.current = null;
        seek(next);
      }
    };
    video.addEventListener('seeked', onSeeked);

    const onLoaded = () => {
      if (unmounted) return;
      setLoaded(true);
      handleResize();
      video.currentTime = 0.5 / FPS;
    };
    video.addEventListener('loadeddata', onLoaded, { once: true });
    video.addEventListener('canplay', onLoaded, { once: true });

    video.src = 'video.mp4';
    video.load();

    window.addEventListener('resize', handleResize);

    return () => {
      unmounted = true;
      window.removeEventListener('resize', handleResize);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('canplay', onLoaded);
      video.src = '';
      videoRef.current = null;
      posterRef.current = null;
    };
  }, []);

  // Main scroll-scrub loop with smooth spring interpolation
  useEffect(() => {
    let raf = 0;
    const track = trackRef.current;

    const getProgress = () => {
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const maxScroll = track.offsetHeight - window.innerHeight;
      return maxScroll > 0 ? Math.min(1, Math.max(0, -rect.top / maxScroll)) : 0;
    };

    const tick = () => {
      const p = getProgress();
      setScrollProg(p);

      const target = p * (FRAMES - 1);
      targetFrameRef.current = target;
      currentFrameRef.current += (target - currentFrameRef.current) * 0.18;
      if (Math.abs(target - currentFrameRef.current) < 0.01) {
        currentFrameRef.current = target;
      }

      seek(Math.round(currentFrameRef.current));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  // Final CTA visibility when showroom is revealed (progress > 0.72)
  const ctaOpacity = Math.max(0, Math.min(1, (scrollProg - 0.72) / 0.16));

  return (
    <section id="top" ref={trackRef} className="silk-hero-track" aria-label="Silk Reveal Video">
      <div className="silk-hero-stage">
        <canvas
          ref={canvasRef}
          className="silk-canvas"
          aria-label="Red silk unfurling to reveal the Akash Sarees showroom"
          role="img"
        />
        <div className="silk-scrim" />

        {/* Action buttons appear gracefully once showroom is fully revealed */}
        {ctaOpacity > 0.02 && (
          <div
            className="silk-reveal-cta"
            style={{
              opacity: ctaOpacity,
              transform: `translateY(${(1 - ctaOpacity) * 20}px)`,
              pointerEvents: ctaOpacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <button
              className="cta-primary"
              onClick={() => {
                setFilter('new');
                scrollToId('arrivals');
              }}
            >
              {site.hero.primaryCta}
              <IconArrow size={16} />
            </button>
            <button
              className="cta-secondary"
              onClick={() => scrollToId('collections')}
            >
              <span className="cta-play">
                <IconPlay size={12} />
              </span>
              {site.hero.secondaryCta}
            </button>
          </div>
        )}

        {/* Scroll hint indicator */}
        <div className="silk-hint" style={{ opacity: scrollProg > 0.03 ? 0 : 1 }}>
          Scroll
        </div>

        {/* Progress bar line */}
        <div className="silk-bar">
          <b style={{ width: `${(scrollProg * 100).toFixed(2)}%` }} />
        </div>
      </div>
    </section>
  );
}

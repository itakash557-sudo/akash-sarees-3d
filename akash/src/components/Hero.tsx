import { useState, useEffect, useRef } from 'react';
import { site } from '../config/site';
import { scrollToId } from '../lib/hooks';
import { useStore } from '../lib/store';
import { IconArrow, IconPlay } from './icons';

const FPS = 24;
const FRAMES = 159;

const SECTIONS = [
  { from: 0, to: 0.23 },
  { from: 0.23, to: 0.47 },
  { from: 0.47, to: 0.73 },
  { from: 0.73, to: 1.0 },
];

export function Hero({ ready: _ready }: { ready?: boolean }) {
  const { setFilter } = useStore();
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProg, setScrollProg] = useState(0);

  const seekingRef = useRef(false);
  const pendingFrameRef = useRef<number | null>(null);
  const shownFrameRef = useRef(-1);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  // Paint the current video frame onto the canvas with high fidelity
  const paint = () => {
    const cv = canvasRef.current;
    const v = videoRef.current;
    if (!cv || !v || v.readyState < 2) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cw = cv.width;
    const ch = cv.height;
    const vw = v.videoWidth || 1280;
    const vh = v.videoHeight || 720;
    const s = Math.max(cw / vw, ch / vh);
    const w = vw * s;
    const h = vh * s;
    ctx.drawImage(v, (cw - w) / 2, (ch - h) / 2, w, h);
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

  // Initialize and preload the video as a memory blob for instant zero-latency scrub
  useEffect(() => {
    let unmounted = false;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    videoRef.current = video;

    const onSeeked = () => {
      paint();
      seekingRef.current = false;
      if (pendingFrameRef.current !== null) {
        const next = pendingFrameRef.current;
        pendingFrameRef.current = null;
        seek(next);
      }
    };
    video.addEventListener('seeked', onSeeked);

    async function initVideo() {
      let src = 'video.mp4';
      try {
        const res = await fetch('video.mp4');
        const total = +(res.headers.get('content-length') || 0);
        const reader = res.body?.getReader();
        if (reader) {
          const chunks: Uint8Array[] = [];
          let received = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done || unmounted) break;
            if (value) {
              chunks.push(value);
              received += value.length;
              if (total > 0 && !unmounted) {
                setLoadPct(Math.round((received / total) * 100));
              }
            }
          }
          if (!unmounted && chunks.length > 0) {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            src = URL.createObjectURL(blob);
            blobUrlRef.current = src;
          }
        }
      } catch {
        // Fallback to direct video src on local/file:// or network restrict
      }

      if (unmounted) return;
      video.src = src;

      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          video.removeEventListener('loadeddata', onLoaded);
          resolve();
        };
        video.addEventListener('loadeddata', onLoaded);
        video.load();
      });

      if (unmounted) return;
      setLoadPct(100);
      setLoaded(true);
      handleResize();
      video.currentTime = 0.5 / FPS;
    }

    initVideo();
    window.addEventListener('resize', handleResize);

    return () => {
      unmounted = true;
      window.removeEventListener('resize', handleResize);
      video.removeEventListener('seeked', onSeeked);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      video.src = '';
      videoRef.current = null;
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

      let active = 0;
      for (let i = 0; i < SECTIONS.length; i++) {
        const s = SECTIONS[i];
        if (p >= s.from && (p < s.to || s.to === 1)) {
          active = i;
          break;
        }
      }
      setActiveSection(active);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToSection = (p: number) => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.offsetHeight - window.innerHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + p * maxScroll, behavior: 'smooth' });
  };

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

        {/* Side rail indicator lines */}
        <nav className="silk-rail" aria-label="Scroll Progress">
          {SECTIONS.map((s, i) => (
            <button
              key={i}
              className={activeSection === i ? 'on' : ''}
              onClick={() => scrollToSection(s.from + 0.06)}
              aria-label={`Scroll to stage ${i + 1}`}
            >
              <i />
            </button>
          ))}
        </nav>

        {/* Accurate loading percentage indicator */}
        <div className="silk-loader" style={{ opacity: loaded ? 0 : 1 }}>
          Loading {loadPct}%
        </div>

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

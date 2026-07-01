import { useEffect, useState, useRef } from 'react';
import { BOOT_LINES } from './bootLines.js';

const LINE_DELAY_MS = 200;
const GLITCH_CHARS = '!@#$%&*<>[]{}|\\/?0123456789ABCDEF';

function GlitchLine({ text, isLatest }) {
  const [display, setDisplay] = useState(text);
  const ticksRef = useRef(0);

  useEffect(() => {
    if (!isLatest || !text) return;
    ticksRef.current = 0;
    const interval = setInterval(() => {
      ticksRef.current++;
      if (ticksRef.current > 5) {
        setDisplay(text);
        clearInterval(interval);
        return;
      }
      setDisplay(
        text
          .split('')
          .map((ch) =>
            ch !== ' ' && Math.random() < 0.35
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : ch
          )
          .join('')
      );
    }, 45);
    return () => clearInterval(interval);
  }, [text, isLatest]);

  if (!text) return <div className="h-4" />;

  return (
    <div
      className={isLatest ? 'text-accent-orange' : 'text-accent-orange/60'}
      style={{ fontFamily: 'inherit' }}
    >
      {display}
    </div>
  );
}

export default function BootSequence({ onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }

  useEffect(() => {
    if (visibleCount >= BOOT_LINES.length) {
      const timer = setTimeout(finish, 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  useEffect(() => {
    window.addEventListener('keydown', finish);
    window.addEventListener('click', finish);
    window.addEventListener('touchstart', finish);
    return () => {
      window.removeEventListener('keydown', finish);
      window.removeEventListener('click', finish);
      window.removeEventListener('touchstart', finish);
    };
  }, []);

  const progress = Math.round((visibleCount / BOOT_LINES.length) * 100);

  return (
    <div className="fixed inset-0 bg-black font-mono overflow-hidden">
      {/* Subtle scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,106,0,0.03) 0px, rgba(255,106,0,0.03) 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Moving beam */}
      <div
        className="absolute left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(255,106,0,0.05) 50%, transparent)',
          animation: 'scanBeam 3s linear infinite',
        }}
      />

      {/* Text content */}
      <div className="relative z-10 p-5 sm:p-8 text-xs sm:text-sm leading-relaxed max-h-screen overflow-hidden">
        {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
          <GlitchLine key={i} text={line} isLatest={i === visibleCount - 1} />
        ))}
        {visibleCount < BOOT_LINES.length && (
          <span className="boot-cursor text-accent-orange">█</span>
        )}
      </div>

      <div className="absolute bottom-6 left-5 right-5 text-[9px] text-dirty-white/25 tracking-widest text-right select-none">
        PRESS ANY KEY TO SKIP
      </div>
    </div>
  );
}

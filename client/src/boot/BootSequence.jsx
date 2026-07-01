import { useEffect, useState } from 'react';
import { BOOT_LINES } from './bootLines.js';

const LINE_DELAY_MS = 220;

export default function BootSequence({ onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= BOOT_LINES.length) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleCount, onComplete]);

  useEffect(() => {
    function skip() {
      onComplete();
    }
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black text-accent-orange font-mono p-6 text-sm">
      {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
        <div key={i}>{line || ' '}</div>
      ))}
      <span className="animate-pulse">_</span>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';

// phases: 'build' → 'glow' → 'flash' → done
export default function StartupScreen({ onComplete }) {
  const [phase, setPhase] = useState('build');
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('flash');
  }

  // Progress bar fills over ~1.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 1.8;
      });
    }, 32);
    return () => clearInterval(interval);
  }, []);

  // At 100% switch to glow
  useEffect(() => {
    if (progress < 100 || phase !== 'build') return;
    const t = setTimeout(() => setPhase('glow'), 300);
    return () => clearTimeout(t);
  }, [progress, phase]);

  // Glow → flash
  useEffect(() => {
    if (phase !== 'glow') return;
    const t = setTimeout(finish, 700);
    return () => clearTimeout(t);
  }, [phase]);

  // Flash → done
  useEffect(() => {
    if (phase !== 'flash') return;
    const t = setTimeout(onComplete, 280);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // Skip on any key / click / touch
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

  const pct = Math.min(100, progress);
  const glowing = phase === 'glow';

  if (phase === 'flash') {
    return <div className="fixed inset-0 bg-white z-[99999]" style={{ animation: 'flashOut 280ms ease-out both' }} />;
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[99999] overflow-hidden">
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Slow scan beam */}
      <div
        className="absolute left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 50%, transparent)',
          animation: 'scanBeam 4s linear infinite',
        }}
      />

      {/* Center logo */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs px-8">

        {/* Logo box */}
        <div
          className="relative border-2 border-white p-8 text-center w-full transition-all duration-500"
          style={{
            boxShadow: glowing
              ? '0 0 60px rgba(255,255,255,0.35), 0 0 120px rgba(255,255,255,0.12), inset 0 0 40px rgba(255,255,255,0.07)'
              : '0 0 20px rgba(255,255,255,0.08)',
          }}
        >
          {/* Corner brackets */}
          <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-white" />
          <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-white" />
          <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-white" />
          <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-white" />

          <div className="text-white/40 text-[9px] uppercase tracking-[0.5em] mb-4 select-none">
            bad silicon labs
          </div>
          <div
            className="text-white font-mono text-4xl font-bold tracking-tight transition-all duration-500 select-none"
            style={{
              textShadow: glowing ? '0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.5)' : 'none',
            }}
          >
            BSL/OS
          </div>
          <div className="text-white/25 text-[9px] tracking-[0.35em] mt-3 uppercase select-none">
            v1.0.0
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-px bg-white/10 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-white transition-none"
              style={{
                width: `${pct}%`,
                boxShadow: '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.4)',
              }}
            />
          </div>
        </div>

        <div className="text-[8px] text-white/20 tracking-[0.3em] uppercase select-none">
          PRESS ANY KEY TO SKIP
        </div>
      </div>
    </div>
  );
}

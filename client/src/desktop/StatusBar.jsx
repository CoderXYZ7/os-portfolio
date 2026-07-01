import { useEffect, useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile.js';

function useFakeMetric(base, amplitude, periodMs) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const t = (Date.now() - start) / periodMs;
      setValue(Math.round(base + amplitude * Math.sin(t * Math.PI * 2)));
    }, 1200);
    return () => clearInterval(timer);
  }, [base, amplitude, periodMs]);
  return value;
}

export default function StatusBar({ connected }) {
  const [now, setNow] = useState(new Date());
  const cpu = useFakeMetric(38, 15, 9000);
  const mem = useFakeMetric(54, 8, 13000);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-graphite/95 border-t border-dirty-white/20 px-3 text-[10px] uppercase tracking-widest z-[10000]"
      style={{
        paddingTop: '4px',
        paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Signal indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`signal-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className={connected ? 'text-accent-blue' : 'text-accent-red'}>
            {isMobile ? (connected ? 'OK' : 'ERR') : (connected ? 'SIGNAL LOCKED' : 'SIGNAL LOST')}
          </span>
        </div>
        {!isMobile && (
          <>
            <span className="text-dirty-white/40">|</span>
            <span className="text-dirty-white/60">
              CPU <span className={cpu > 50 ? 'text-accent-amber' : 'text-dirty-white'}>{cpu}%</span>
            </span>
            <span className="text-dirty-white/40">|</span>
            <span className="text-dirty-white/60">
              MEM <span className={mem > 60 ? 'text-accent-amber' : 'text-dirty-white'}>{mem}%</span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isMobile && (
          <span className="text-dirty-white/30">BAD SILICON LABS</span>
        )}
        <span className="text-dirty-white/70 tabular-nums">
          {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

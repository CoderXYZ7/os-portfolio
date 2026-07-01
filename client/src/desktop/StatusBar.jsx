import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-graphite border-t-2 border-dirty-white px-3 py-1 text-xs uppercase tracking-wide z-[10000]">
      <div className="flex items-center gap-4">
        <span className={connected ? 'text-accent-blue' : 'text-accent-red'}>
          SIGNAL: {connected ? 'LOCKED' : 'LOST'}
        </span>
        <span>CPU {cpu}%</span>
        <span>MEM {mem}%</span>
      </div>
      <span>{now.toLocaleTimeString()}</span>
    </div>
  );
}

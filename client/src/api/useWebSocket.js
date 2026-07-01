import { useEffect, useRef, useState } from 'react';

export function useWebSocket(onMessage) {
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    let socket;
    let retryDelay = 1000;
    let retryTimer;
    let cancelled = false;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/portfolio/ws`);

      socket.addEventListener('open', () => {
        retryDelay = 1000;
        setConnected(true);
      });

      socket.addEventListener('message', (event) => {
        try {
          onMessageRef.current?.(JSON.parse(event.data));
        } catch {
          // ignore malformed messages
        }
      });

      socket.addEventListener('close', () => {
        setConnected(false);
        if (cancelled) return;
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      });
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);

  return { connected };
}

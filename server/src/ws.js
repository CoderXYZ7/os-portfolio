import { WebSocketServer } from 'ws';

export function createWsServer(httpServer, wsPath = '/portfolio/ws') {
  const wss = new WebSocketServer({ server: httpServer, path: wsPath });

  function broadcast(message) {
    const payload = JSON.stringify(message);
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }
  }

  return { wss, broadcast };
}

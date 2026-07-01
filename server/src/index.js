import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContentStore } from './store.js';
import { createProjectsRouter } from './routes/projects.js';
import { createContentRouter } from './routes/content.js';
import { createWsServer } from './ws.js';
import { createWatcher } from './watcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');

const PROJECTS_DIR = process.env.PROJECTS_DIR ?? path.join(__dirname, '..', 'projects');
const CONTENT_DIR  = process.env.CONTENT_DIR  ?? path.join(__dirname, '..', 'content');
const CLIENT_DIST  = path.join(ROOT, 'client', 'dist');
const PORT         = Number(process.env.PORT ?? 443);

const store = new ContentStore(PROJECTS_DIR, CONTENT_DIR);

const app = express();
app.use(cors());

app.use('/portfolio/api/projects', createProjectsRouter(store, PROJECTS_DIR));
app.use('/portfolio/api/content',  createContentRouter(store));
app.use('/portfolio', express.static(CLIENT_DIST));
app.get('/portfolio/*splat', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
app.get('/', (_req, res) => res.redirect('/portfolio'));

await store.refresh();

function startOn(port) {
  return new Promise((resolve, reject) => {
    const srv = app.listen(port)
      .once('listening', () => resolve(srv))
      .once('error', reject);
  });
}

async function tryPorts(ports) {
  for (const port of ports) {
    try {
      const srv = await startOn(port);
      console.log(`[portfolio] http://localhost:${port}/portfolio`);
      return srv;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[portfolio] Port ${port} in use, trying next...`);
      } else if (err.code === 'EACCES') {
        console.warn(`[portfolio] Port ${port} requires privileges, trying next...`);
      } else {
        throw err;
      }
    }
  }
  throw new Error('[portfolio] All ports exhausted. Set PORT= to choose a free port.');
}

// Try requested port first, then common fallbacks
const fallbacks = PORT === 443
  ? [443, 8443, 4443, 3000]
  : [PORT, 4443, 3000];

const server = await tryPorts(fallbacks);

const { broadcast } = createWsServer(server, '/portfolio/ws');
const watcher = createWatcher(store, broadcast, { projectsDir: PROJECTS_DIR, contentDir: CONTENT_DIR });

export { server, store, broadcast, watcher, PROJECTS_DIR, CONTENT_DIR };

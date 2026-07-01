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
const PORT         = process.env.PORT ?? 443;

const store = new ContentStore(PROJECTS_DIR, CONTENT_DIR);

const app = express();
app.use(cors());

// ── API under /portfolio/api ──────────────────────────────────────────────
app.use('/portfolio/api/projects', createProjectsRouter(store, PROJECTS_DIR));
app.use('/portfolio/api/content',  createContentRouter(store));

// ── Built client static files at /portfolio ───────────────────────────────
app.use('/portfolio', express.static(CLIENT_DIST));

// ── SPA fallback: any /portfolio/* that isn't a file → index.html ─────────
app.get('/portfolio/*splat', (_req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// ── Root redirect ─────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.redirect('/portfolio'));

await store.refresh();

const server = app.listen(PORT, () => {
  console.log(`[portfolio] http://localhost:${PORT}/portfolio`);
});

// WebSocket at /portfolio/ws
const { broadcast } = createWsServer(server, '/portfolio/ws');
const watcher = createWatcher(store, broadcast, { projectsDir: PROJECTS_DIR, contentDir: CONTENT_DIR });

export { server, store, broadcast, watcher, PROJECTS_DIR, CONTENT_DIR };

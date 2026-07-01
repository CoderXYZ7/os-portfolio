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
const PROJECTS_DIR = process.env.PROJECTS_DIR ?? path.join(__dirname, '..', 'projects');
const CONTENT_DIR = process.env.CONTENT_DIR ?? path.join(__dirname, '..', 'content');
const PORT = process.env.PORT ?? 4000;

const store = new ContentStore(PROJECTS_DIR, CONTENT_DIR);

const app = express();
app.use(cors());
app.use('/api/projects', createProjectsRouter(store, PROJECTS_DIR));
app.use('/api/content', createContentRouter(store));

await store.refresh();

const server = app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

const { broadcast } = createWsServer(server);
const watcher = createWatcher(store, broadcast, { projectsDir: PROJECTS_DIR, contentDir: CONTENT_DIR });

export { server, store, broadcast, watcher, PROJECTS_DIR, CONTENT_DIR };

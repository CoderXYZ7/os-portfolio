import express from 'express';
import path from 'node:path';

export function createProjectsRouter(store, projectsDir) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(store.getProjects());
  });

  router.get('/:slug', (req, res) => {
    const project = store.getProject(req.params.slug);
    if (!project) {
      res.status(404).json({ error: 'project not found' });
      return;
    }
    res.json(project);
  });

  router.use('/:slug/images', (req, res, next) => {
    const slug = req.params.slug;
    express.static(path.join(projectsDir, slug, 'images'))(req, res, next);
  });

  return router;
}

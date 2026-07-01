import express from 'express';

export function createContentRouter(store) {
  const router = express.Router();

  router.get('/about', (req, res) => {
    res.json({ html: store.getAbout() });
  });

  router.get('/contact', (req, res) => {
    res.json(store.getContact());
  });

  return router;
}

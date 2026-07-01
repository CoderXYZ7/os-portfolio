import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProjects, fetchProject, fetchAbout, fetchContact } from '../src/api/client.js';

beforeEach(() => {
  global.fetch = vi.fn();
});

describe('api client', () => {
  it('fetchProjects calls /api/projects and returns JSON', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [{ slug: 'a' }] });
    const result = await fetchProjects();
    expect(global.fetch).toHaveBeenCalledWith('/portfolio/api/projects');
    expect(result).toEqual([{ slug: 'a' }]);
  });

  it('fetchProject calls /api/projects/:slug', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ slug: 'a' }) });
    const result = await fetchProject('a');
    expect(global.fetch).toHaveBeenCalledWith('/portfolio/api/projects/a');
    expect(result).toEqual({ slug: 'a' });
  });

  it('throws when the response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchProject('missing')).rejects.toThrow('404');
  });

  it('fetchAbout calls /api/content/about', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ html: '<p>hi</p>' }) });
    const result = await fetchAbout();
    expect(global.fetch).toHaveBeenCalledWith('/portfolio/api/content/about');
    expect(result).toEqual({ html: '<p>hi</p>' });
  });

  it('fetchContact calls /api/content/contact', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] });
    const result = await fetchContact();
    expect(global.fetch).toHaveBeenCalledWith('/portfolio/api/content/contact');
    expect(result).toEqual([]);
  });
});

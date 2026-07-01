import fs from 'node:fs/promises';
import path from 'node:path';
import { parseProjectFolder } from './projectParser.js';
import { parseAboutMarkdown, parseContactJson } from './contentParser.js';

export class ContentStore {
  constructor(projectsDir, contentDir) {
    this.projectsDir = projectsDir;
    this.contentDir = contentDir;
    this.projects = [];
    this.about = null;
    this.contact = [];
  }

  async refresh() {
    this.projects = await this.#scanProjects();
    this.about = await parseAboutMarkdown(path.join(this.contentDir, 'about.md'));
    this.contact = await parseContactJson(path.join(this.contentDir, 'contact.json'));
  }

  async #scanProjects() {
    let entries;
    try {
      entries = await fs.readdir(this.projectsDir, { withFileTypes: true });
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }

    const folders = entries.filter((e) => e.isDirectory());
    const parsed = await Promise.all(
      folders.map((dir) => parseProjectFolder(path.join(this.projectsDir, dir.name), dir.name))
    );
    return parsed.filter((p) => p !== null);
  }

  getProjects() {
    return this.projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags,
      featured: p.featured,
      thumbnail: p.images[0] ?? null,
    }));
  }

  getProject(slug) {
    return this.projects.find((p) => p.slug === slug) ?? null;
  }

  getAbout() {
    return this.about;
  }

  getContact() {
    return this.contact;
  }
}

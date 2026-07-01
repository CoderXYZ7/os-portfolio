const BASE = '/portfolio/api';

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`);
  }
  return res.json();
}

export function fetchProjects() {
  return getJson(`${BASE}/projects`);
}

export function fetchProject(slug) {
  return getJson(`${BASE}/projects/${slug}`);
}

export function fetchAbout() {
  return getJson(`${BASE}/content/about`);
}

export function fetchContact() {
  return getJson(`${BASE}/content/contact`);
}

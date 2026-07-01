async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`);
  }
  return res.json();
}

export function fetchProjects() {
  return getJson('/api/projects');
}

export function fetchProject(slug) {
  return getJson(`/api/projects/${slug}`);
}

export function fetchAbout() {
  return getJson('/api/content/about');
}

export function fetchContact() {
  return getJson('/api/content/contact');
}

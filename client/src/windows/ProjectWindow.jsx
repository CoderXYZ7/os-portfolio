import { useEffect, useState } from 'react';
import { fetchProject } from '../api/client.js';
import ImageCarousel from './ImageCarousel.jsx';

export default function ProjectWindow({ slug }) {
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchProject(slug)
      .then((data) => !cancelled && setProject(data))
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) return <div className="text-accent-red">Failed to load project.</div>;
  if (!project) return <div>Loading...</div>;

  return (
    <div>
      {project.tags.length > 0 && (
        <div className="flex gap-1 mb-2 text-[10px] uppercase">
          {project.tags.map((tag) => (
            <span key={tag} className="border border-accent-blue px-1 text-accent-blue">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: project.bodyHtml }} />
      <ImageCarousel slug={slug} images={project.images} />
      <div className="flex gap-3 mt-3 text-accent-blue underline text-xs">
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer">
            REPO
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            LIVE
          </a>
        )}
      </div>
    </div>
  );
}

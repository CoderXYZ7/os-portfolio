import { useEffect, useState } from 'react';
import { fetchProject } from '../api/client.js';
import ImageCarousel from './ImageCarousel.jsx';

const TAG_COLORS = [
  'border-accent-orange text-accent-orange',
  'border-accent-blue text-accent-blue',
  'border-accent-amber text-accent-amber',
  'border-dirty-white/60 text-dirty-white/80',
];

function tagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_COLORS[h % TAG_COLORS.length];
}

export default function ProjectWindow({ slug }) {
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchProject(slug)
      .then((data) => !cancelled && setProject(data))
      .catch((err) => !cancelled && setError(err));
    return () => { cancelled = true; };
  }, [slug]);

  if (error) return <div className="text-accent-red p-2 text-xs">Failed to load project.</div>;
  if (!project) return (
    <div className="flex items-center gap-2 p-2 text-xs text-dirty-white/50">
      <span className="animate-pulse">...</span> Loading
    </div>
  );

  return (
    <div className="text-sm flex flex-col gap-3">
      {/* Header bar */}
      <div className="border-b border-dirty-white/10 pb-2">
        <div className="text-[9px] uppercase tracking-[0.2em] text-accent-orange/60 mb-1">
          project // {slug}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`border text-[9px] uppercase tracking-wide px-1.5 py-0 leading-snug ${tagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rendered markdown body */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: project.bodyHtml }} />

      {/* Image carousel */}
      <ImageCarousel slug={slug} images={project.images} />

      {/* Links */}
      {(project.repoUrl || project.liveUrl) && (
        <div className="flex gap-3 pt-2 border-t border-dirty-white/10">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase tracking-widest border border-accent-blue text-accent-blue px-2 py-1 hover:bg-accent-blue hover:text-graphite transition-colors"
            >
              Repo
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase tracking-widest border border-accent-orange text-accent-orange px-2 py-1 hover:bg-accent-orange hover:text-graphite transition-colors"
            >
              Live
            </a>
          )}
        </div>
      )}
    </div>
  );
}

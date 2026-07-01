import { useEffect, useState } from 'react';
import { fetchAbout } from '../api/client.js';

export default function AboutWindow() {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    fetchAbout().then((data) => setHtml(data.html));
  }, []);

  if (html === null) return (
    <div className="flex items-center gap-2 p-2 text-xs text-dirty-white/50">
      <span className="animate-pulse">...</span> Loading
    </div>
  );

  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

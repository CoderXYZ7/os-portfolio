import { useEffect, useState } from 'react';
import { fetchAbout } from '../api/client.js';

export default function AboutWindow() {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    fetchAbout().then((data) => setHtml(data.html));
  }, []);

  if (html === null) return <div>Loading...</div>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

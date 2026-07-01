import { useEffect, useState } from 'react';
import { fetchContact } from '../api/client.js';

export default function ContactWindow() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    fetchContact().then(setEntries);
  }, []);

  if (entries === null) return <div>Loading...</div>;
  if (entries.length === 0) return <div>No contact info configured.</div>;

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.label}>
          <span className="uppercase text-accent-blue text-xs">{entry.label}:</span>{' '}
          <a href={entry.href} className="underline" target="_blank" rel="noreferrer">
            {entry.value}
          </a>
        </li>
      ))}
    </ul>
  );
}

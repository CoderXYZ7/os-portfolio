import { useProjects } from './useProjects.js';
import { useWebSocket } from '../api/useWebSocket.js';
import { useWindowManager } from '../windows/WindowManagerContext.jsx';
import Window from '../windows/Window.jsx';
import DesktopIcon from './DesktopIcon.jsx';
import StatusBar from './StatusBar.jsx';
import ProjectWindow from '../windows/ProjectWindow.jsx';
import AboutWindow from '../windows/AboutWindow.jsx';
import ContactWindow from '../windows/ContactWindow.jsx';
import TerminalWindow from '../windows/TerminalWindow.jsx';

export default function Desktop() {
  const { projects, refresh } = useProjects();
  const { connected } = useWebSocket((msg) => {
    if (msg.type === 'changed') refresh();
  });
  const { windows, openWindow, restoreWindow } = useWindowManager();

  function openProject(slug, title) {
    openWindow(`project:${slug}`, title, <ProjectWindow slug={slug} />);
  }

  const minimizedWindows = windows.filter((w) => w.minimized);

  return (
    <div className="crt-scanlines grain min-h-screen pb-8">
      <div className="flex flex-wrap gap-2 p-4">
        {projects.map((p) => (
          <DesktopIcon key={p.slug} label={p.title} onOpen={() => openProject(p.slug, p.title)} />
        ))}
        <DesktopIcon
          label="Terminal"
          onOpen={() =>
            openWindow(
              'terminal',
              'Terminal',
              <TerminalWindow projects={projects} openProject={openProject} />
            )
          }
        />
        <DesktopIcon
          label="About Me"
          onOpen={() => openWindow('about', 'About Me', <AboutWindow />)}
        />
        <DesktopIcon
          label="Contact"
          onOpen={() => openWindow('contact', 'Contact', <ContactWindow />)}
        />
      </div>

      {windows.map(
        (w) =>
          !w.minimized && (
            <Window key={w.id} id={w.id} title={w.title} zIndex={w.zIndex}>
              {w.content}
            </Window>
          )
      )}

      {minimizedWindows.length > 0 && (
        <div className="fixed bottom-7 left-0 right-0 flex gap-1 px-3 z-[9999]">
          {minimizedWindows.map((w) => (
            <button
              key={w.id}
              onClick={() => restoreWindow(w.id)}
              className="border-2 border-accent-orange bg-graphite text-accent-orange text-[10px] uppercase tracking-wide px-2 py-1"
            >
              {w.title}
            </button>
          ))}
        </div>
      )}

      <StatusBar connected={connected} />
    </div>
  );
}

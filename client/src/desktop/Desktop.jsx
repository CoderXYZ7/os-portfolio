import { useMemo } from 'react';
import { useProjects } from './useProjects.js';
import { useWebSocket } from '../api/useWebSocket.js';
import { useWindowManager } from '../windows/WindowManagerContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { getSessionPattern } from './bgPatterns.js';
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
  const isMobile = useIsMobile();
  const bgPattern = useMemo(() => getSessionPattern(), []);

  function openProject(slug, title) {
    openWindow(`project:${slug}`, title, <ProjectWindow slug={slug} />);
  }

  const minimizedWindows = windows.filter((w) => w.minimized);

  const systemIcons = [
    {
      label: 'Terminal',
      onOpen: () =>
        openWindow('terminal', 'Terminal', <TerminalWindow projects={projects} openProject={openProject} />),
    },
    {
      label: 'About Me',
      onOpen: () => openWindow('about', 'About Me', <AboutWindow />),
    },
    {
      label: 'Contact',
      onOpen: () => openWindow('contact', 'Contact', <ContactWindow />),
    },
  ];

  return (
    <div className="crt-scanlines grain min-h-screen pb-7 flex flex-col">
      {/* Background pattern (random per session) */}
      <div className="fixed inset-0 pointer-events-none" style={bgPattern.style} />
      {/* Pattern label — bottom right, very subtle */}
      <div className="fixed bottom-7 right-2 text-[7px] uppercase tracking-[0.2em] text-white/15 select-none pointer-events-none z-[9990]">
        {bgPattern.label}
      </div>
      {/* Animated scan beam */}
      <div className="scan-beam" />

      {isMobile ? (
        /* ── Mobile layout ── */
        <div className="flex flex-col flex-1">
          {/* System app row */}
          <div className="flex items-center justify-around border-b border-dirty-white/10 py-2 px-3">
            <span className="text-[8px] uppercase tracking-[0.15em] text-dirty-white/30">System</span>
            {systemIcons.map((s, i) => (
              <DesktopIcon key={s.label} label={s.label} variant="system" onOpen={s.onOpen} staggerIndex={i} />
            ))}
          </div>

          {/* Projects grid */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/80 font-bold">Projects</span>
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-[9px] text-white/40 tabular-nums">{String(projects.length).padStart(2, '0')}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {projects.map((p, i) => (
                <DesktopIcon
                  key={p.slug}
                  label={p.title}
                  tags={p.tags}
                  variant="project"
                  onOpen={() => openProject(p.slug, p.title)}
                  staggerIndex={i}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Desktop layout ── */
        <div className="flex flex-1">
          {/* Left: project icons */}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-4 select-none">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/80 font-bold">Projects</span>
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-[9px] text-white/40 tabular-nums">{String(projects.length).padStart(2, '0')}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {projects.map((p, i) => (
                <DesktopIcon
                  key={p.slug}
                  label={p.title}
                  tags={p.tags}
                  variant="project"
                  onOpen={() => openProject(p.slug, p.title)}
                  staggerIndex={i}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>

          {/* Right: system apps */}
          <div className="w-24 flex flex-col items-center gap-1 pt-4 pr-2 border-l border-dirty-white/10">
            <div className="text-[8px] uppercase tracking-[0.15em] text-white/50 mb-2 select-none font-bold">System</div>
            {systemIcons.map((s, i) => (
              <DesktopIcon
                key={s.label}
                label={s.label}
                variant="system"
                onOpen={s.onOpen}
                isMobile={isMobile}
                staggerIndex={projects.length + i}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Windows ── */}
      {windows.map(
        (w) =>
          !w.minimized && (
            <Window key={w.id} id={w.id} title={w.title} zIndex={w.zIndex} isMobile={isMobile}>
              {w.content}
            </Window>
          )
      )}

      {/* ── Minimized taskbar ── */}
      {minimizedWindows.length > 0 && (
        <div className="fixed bottom-7 left-0 right-0 flex gap-1 px-3 z-[9990] flex-wrap">
          {minimizedWindows.map((w) => (
            <button
              key={w.id}
              onClick={() => restoreWindow(w.id)}
              className="border border-accent-orange/60 bg-graphite text-accent-orange text-[9px] uppercase tracking-wide px-2 py-1 hover:border-accent-orange hover:bg-accent-orange/10 transition-colors active:bg-accent-orange/20"
            >
              [{w.title}]
            </button>
          ))}
        </div>
      )}

      <StatusBar connected={connected} />
    </div>
  );
}

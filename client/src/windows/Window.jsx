import { Rnd } from 'react-rnd';
import { useWindowManager } from './WindowManagerContext.jsx';

function MobileWindow({ id, title, children }) {
  const { closeWindow, minimizeWindow } = useWindowManager();

  return (
    <div
      className="mobile-window-enter fixed inset-0 bg-graphite flex flex-col border-2 border-accent-orange"
      style={{ zIndex: 9500 }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between bg-accent-orange text-graphite px-3 py-2 uppercase tracking-wide text-xs font-bold flex-shrink-0">
        <span className="truncate">{title}</span>
        <div className="flex gap-1">
          <button
            className="px-2 py-0.5 border border-graphite text-graphite"
            onClick={() => minimizeWindow(id)}
            aria-label="minimize"
          >
            _
          </button>
          <button
            className="px-2 py-0.5 border border-graphite bg-accent-red text-dirty-white"
            onClick={() => closeWindow(id)}
            aria-label="close"
          >
            X
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 text-sm">
        {children}
      </div>
    </div>
  );
}

function DesktopWindow({ id, title, zIndex, children }) {
  const { closeWindow, focusWindow, minimizeWindow } = useWindowManager();

  return (
    <Rnd
      default={{ x: 60 + Math.random() * 80, y: 50 + Math.random() * 40, width: 520, height: 400 }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      style={{ zIndex }}
      onDragStart={() => focusWindow(id)}
      onResizeStart={() => focusWindow(id)}
      className="border-2 border-accent-orange bg-graphite shadow-[8px_8px_0_rgba(0,0,0,0.7)]"
    >
      <div className="window-enter flex flex-col h-full">
        {/* White accent stripe */}
        <div className="h-px bg-white/30 flex-shrink-0" />

        {/* Title bar */}
        <div
          className="flex items-center justify-between bg-accent-orange text-graphite px-2 py-1 cursor-move uppercase tracking-wide text-xs font-bold flex-shrink-0"
          onMouseDown={() => focusWindow(id)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-graphite/50 text-[10px]">//</span>
            <span className="truncate">{title}</span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              className="px-2 border border-graphite hover:bg-graphite/20 transition-colors"
              onClick={() => minimizeWindow(id)}
              aria-label="minimize"
            >
              _
            </button>
            <button
              className="px-2 border border-graphite bg-accent-red text-dirty-white hover:bg-red-700 transition-colors"
              onClick={() => closeWindow(id)}
              aria-label="close"
            >
              X
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-3 overflow-auto flex-1 text-sm"
          onMouseDown={() => focusWindow(id)}
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
}

export default function Window({ id, title, zIndex, children, isMobile }) {
  if (isMobile) {
    return <MobileWindow id={id} title={title}>{children}</MobileWindow>;
  }
  return <DesktopWindow id={id} title={title} zIndex={zIndex}>{children}</DesktopWindow>;
}

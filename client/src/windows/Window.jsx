import { Rnd } from 'react-rnd';
import { useWindowManager } from './WindowManagerContext.jsx';
import { useKeyboardOffset } from '../hooks/useVisualViewport.js';

function MobileWindow({ id, title, children }) {
  const { closeWindow, minimizeWindow } = useWindowManager();
  const kbOffset = useKeyboardOffset();

  return (
    <div
      className="mobile-window-enter fixed inset-0 bg-graphite flex flex-col border-2 border-accent-orange"
      style={{
        zIndex: 9500,
        // dvh shrinks with keyboard on modern browsers; kbOffset is the fallback
        height: `calc(100dvh - ${kbOffset}px)`,
        // safe area for notched phones
        paddingBottom: `env(safe-area-inset-bottom, 0px)`,
      }}
    >
      {/* White accent stripe */}
      <div className="h-px bg-white/30 flex-shrink-0" />

      {/* Title bar — tall enough for comfortable tapping */}
      <div className="flex items-center justify-between bg-accent-orange text-graphite px-3 py-3 uppercase tracking-wide text-xs font-bold flex-shrink-0">
        <span className="truncate">{title}</span>
        <div className="flex gap-2">
          <button
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-graphite active:bg-graphite/30 touch-manipulation"
            onClick={() => minimizeWindow(id)}
            aria-label="minimize"
          >
            _
          </button>
          <button
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-graphite bg-accent-red text-dirty-white active:bg-red-800 touch-manipulation"
            onClick={() => closeWindow(id)}
            aria-label="close"
          >
            X
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 text-sm overscroll-contain">
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
        <div className="h-px bg-white/30 flex-shrink-0" />

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

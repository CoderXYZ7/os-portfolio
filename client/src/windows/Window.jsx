import { Rnd } from 'react-rnd';
import { useWindowManager } from './WindowManagerContext.jsx';

export default function Window({ id, title, zIndex, children }) {
  const { closeWindow, focusWindow, minimizeWindow } = useWindowManager();

  return (
    <Rnd
      default={{ x: 80, y: 80, width: 480, height: 360 }}
      minWidth={280}
      minHeight={180}
      bounds="window"
      style={{ zIndex }}
      onDragStart={() => focusWindow(id)}
      onResizeStart={() => focusWindow(id)}
      className="border-2 border-accent-orange bg-graphite shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
    >
      <div
        className="flex items-center justify-between bg-accent-orange text-graphite px-2 py-1 cursor-move uppercase tracking-wide text-xs font-bold"
        onMouseDown={() => focusWindow(id)}
      >
        <span>{title}</span>
        <div className="flex gap-1">
          <button
            className="px-2 border border-graphite"
            onClick={() => minimizeWindow(id)}
            aria-label="minimize"
          >
            _
          </button>
          <button
            className="px-2 border border-graphite bg-accent-red text-dirty-white"
            onClick={() => closeWindow(id)}
            aria-label="close"
          >
            X
          </button>
        </div>
      </div>
      <div className="p-3 overflow-auto h-[calc(100%-2rem)] text-sm" onMouseDown={() => focusWindow(id)}>
        {children}
      </div>
    </Rnd>
  );
}

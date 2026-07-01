export default function DesktopIcon({ label, onOpen }) {
  return (
    <button
      onDoubleClick={onOpen}
      className="hud-corners glitch-hover flex flex-col items-center gap-1 w-24 p-2 text-center text-xs uppercase tracking-wide hover:text-accent-orange focus:outline-none focus:text-accent-orange"
    >
      <div className="w-10 h-10 border-2 border-dirty-white" />
      <span>{label}</span>
    </button>
  );
}

const TAG_COLORS = [
  'text-accent-orange border-accent-orange',
  'text-accent-blue border-accent-blue',
  'text-accent-amber border-accent-amber',
  'text-dirty-white border-dirty-white',
];

function tagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_COLORS[h % TAG_COLORS.length];
}

const TAG_SYMBOLS = {
  Python: 'PY', 'C++': 'C+', PHP: 'PH', Flutter: 'FL',
  JavaScript: 'JS', TypeScript: 'TS', Go: 'GO', Rust: 'RS',
  Docker: 'DK', Linux: 'LX', Qt6: 'QT', KDE: 'KD',
  React: 'RE', Swift: 'SW', Kotlin: 'KT', Java: 'JV',
  SQL: 'SQ', SQLite: 'DB', MySQL: 'MY', Dart: 'DA',
  AI: 'AI', Security: 'SC', Networking: 'NW', Wiki: 'WK',
  'Computer Vision': 'CV', Physics: 'PH', Forensics: 'FR',
  'Protocol Design': 'PR', 'ASCII Art': 'AS', Video: 'VI',
};

const SYSTEM_GLYPHS = {
  Terminal: '>_',
  'About Me': '/me',
  Contact: '<<',
};

function getSymbol(tags, label, isSystem) {
  if (isSystem) return SYSTEM_GLYPHS[label] ?? label.slice(0, 2).toUpperCase();
  if (!tags || tags.length === 0) return '??';
  return TAG_SYMBOLS[tags[0]] ?? tags[0].slice(0, 2).toUpperCase();
}

export default function DesktopIcon({ label, tags = [], onOpen, variant = 'project', staggerIndex = 0, isMobile = false }) {
  const isSystem = variant === 'system';
  const symbol = getSymbol(tags, label, isSystem);

  // Mobile: single tap for everything. Desktop: system=click, project=dblclick (OS convention).
  const handleClick = (isMobile || isSystem) ? onOpen : undefined;
  const handleDblClick = (!isMobile && !isSystem) ? onOpen : undefined;

  return (
    <button
      onClick={handleClick}
      onDoubleClick={handleDblClick}
      className={[
        'anim-fade-in-up group flex flex-col items-center gap-1.5 p-2 text-center',
        'focus:outline-none transition-colors duration-100 select-none touch-manipulation',
        isSystem
          ? 'w-20 hover:text-accent-blue focus:text-accent-blue active:text-accent-blue'
          : 'w-28 hover:text-accent-orange focus:text-accent-orange active:text-accent-orange',
      ].join(' ')}
      style={{ '--stagger': `${staggerIndex * 25}ms` }}
    >
      {/* Icon box */}
      <div
        className={[
          'glitch-hover relative flex flex-col items-center justify-center gap-0.5 overflow-hidden',
          isSystem ? 'w-10 h-10' : 'w-12 h-12',
          isSystem
            ? 'border border-accent-blue/50 group-hover:border-accent-blue group-hover:shadow-[0_0_8px_rgba(58,160,255,0.4)] group-active:border-accent-blue'
            : 'border-2 border-dirty-white/40 group-hover:border-accent-orange group-hover:shadow-[0_0_10px_rgba(255,106,0,0.4)] group-active:border-accent-orange',
          'transition-all duration-150',
        ].join(' ')}
      >
        {/* Corner accents on project icons */}
        {!isSystem && (
          <>
            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent-orange opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-accent-orange opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-accent-orange opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent-orange opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          </>
        )}

        {/* Scanline interior on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Symbol */}
        <span
          className={[
            'relative z-10 font-mono font-bold leading-none tracking-wider transition-colors duration-150',
            isSystem
              ? 'text-[11px] text-accent-blue/70 group-hover:text-accent-blue'
              : 'text-[12px] text-dirty-white/60 group-hover:text-accent-orange',
          ].join(' ')}
        >
          {symbol}
        </span>

        {/* Decorative bottom line */}
        <div
          className={[
            'relative z-10 h-px w-6 transition-all duration-150',
            isSystem
              ? 'bg-accent-blue/30 group-hover:bg-accent-blue/70 group-hover:w-8'
              : 'bg-dirty-white/20 group-hover:bg-accent-orange/60 group-hover:w-9',
          ].join(' ')}
        />
      </div>

      {/* Label */}
      <span
        className={[
          'uppercase tracking-wide leading-tight',
          isSystem
            ? 'text-[8px] text-dirty-white/50 group-hover:text-accent-blue transition-colors duration-150'
            : 'text-[9px] text-dirty-white/70 group-hover:text-accent-orange transition-colors duration-150',
        ].join(' ')}
        style={{ wordBreak: 'break-word', maxWidth: isSystem ? '72px' : '100px' }}
      >
        {label}
      </span>

      {/* Tag pills - project icons only, first 2 */}
      {!isSystem && tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={`border text-[7px] uppercase tracking-wide px-1 leading-tight opacity-50 group-hover:opacity-90 transition-opacity duration-150 ${tagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// Each pattern is a CSS backgroundImage + optional backgroundSize/Position.
// All include the white corner flare and a second accent glow.
// The base graphite body color is always behind these.

const FLARE_TOP_RIGHT = 'radial-gradient(ellipse 80% 55% at 92% -5%, rgba(255,255,255,0.06) 0%, transparent 100%)';
const GLOW_BOTTOM_LEFT = 'radial-gradient(ellipse 40% 30% at 8% 95%, rgba(58,160,255,0.05) 0%, transparent 100%)';

export const BG_PATTERNS = [
  {
    name: 'dot-grid',
    label: 'DOT MATRIX',
    style: {
      backgroundImage: [
        FLARE_TOP_RIGHT,
        GLOW_BOTTOM_LEFT,
        'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: 'auto, auto, 28px 28px',
      backgroundPosition: 'top right, bottom left, 0 0',
    },
  },
  {
    name: 'cross-grid',
    label: 'GRID',
    style: {
      backgroundImage: [
        FLARE_TOP_RIGHT,
        'radial-gradient(ellipse 50% 40% at 5% 90%, rgba(255,106,0,0.04) 0%, transparent 100%)',
        'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: 'auto, auto, 24px 24px, 24px 24px',
      backgroundPosition: 'top right, bottom left, 0 0, 0 0',
    },
  },
  {
    name: 'blueprint',
    label: 'BLUEPRINT',
    style: {
      backgroundImage: [
        FLARE_TOP_RIGHT,
        'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(58,160,255,0.06) 0%, transparent 100%)',
        'linear-gradient(rgba(58,160,255,0.07) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(58,160,255,0.07) 1px, transparent 1px)',
        'linear-gradient(rgba(58,160,255,0.025) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(58,160,255,0.025) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: 'auto, auto, 100px 100px, 100px 100px, 20px 20px, 20px 20px',
      backgroundPosition: 'top right, bottom center, 0 0, 0 0, 0 0, 0 0',
    },
  },
  {
    name: 'diagonal',
    label: 'DIAGONAL',
    style: {
      backgroundImage: [
        FLARE_TOP_RIGHT,
        GLOW_BOTTOM_LEFT,
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 18px)',
        'repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 36px)',
      ].join(', '),
      backgroundSize: 'auto',
    },
  },
  {
    name: 'hex-dots',
    label: 'HEX ARRAY',
    style: {
      backgroundImage: [
        FLARE_TOP_RIGHT,
        'radial-gradient(ellipse 40% 35% at 0% 50%, rgba(217,164,65,0.04) 0%, transparent 100%)',
        'radial-gradient(circle, rgba(255,255,255,0.16) 1.5px, transparent 1.5px)',
        'radial-gradient(circle, rgba(255,255,255,0.16) 1.5px, transparent 1.5px)',
      ].join(', '),
      backgroundSize: 'auto, auto, 32px 18px, 32px 18px',
      backgroundPosition: 'top right, center left, 0 0, 16px 9px',
    },
  },
  {
    name: 'circuit',
    label: 'CIRCUIT',
    style: {
      backgroundImage: [
        FLARE_TOP_RIGHT,
        'radial-gradient(ellipse 30% 60% at 100% 50%, rgba(58,160,255,0.04) 0%, transparent 100%)',
        // vertical + horizontal lines at wide spacing for circuit feel
        'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        // dots at intersections
        'radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: 'auto, auto, 48px 48px, 48px 48px, 48px 48px',
      backgroundPosition: 'top right, center right, 0 0, 0 0, 0 0',
    },
  },
];

export function getSessionPattern() {
  return BG_PATTERNS[Math.floor(Math.random() * BG_PATTERNS.length)];
}

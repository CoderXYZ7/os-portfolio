import { useEffect, useState } from 'react';

// Returns the distance (px) the keyboard has pushed the viewport up.
// On browsers without visualViewport API, always returns 0.
export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      // offset = space below the visible viewport (keyboard height)
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setOffset(kb);
    }

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}

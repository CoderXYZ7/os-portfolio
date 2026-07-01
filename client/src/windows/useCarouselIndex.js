import { useState } from 'react';

export function useCarouselIndex(length) {
  const [index, setIndex] = useState(0);

  if (length <= 0) {
    return { index: 0, next: () => {}, prev: () => {}, goTo: () => {} };
  }

  return {
    index,
    next: () => setIndex((i) => (i + 1) % length),
    prev: () => setIndex((i) => (i - 1 + length) % length),
    goTo: (i) => setIndex(((i % length) + length) % length),
  };
}

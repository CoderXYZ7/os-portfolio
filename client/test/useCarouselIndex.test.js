import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarouselIndex } from '../src/windows/useCarouselIndex.js';

describe('useCarouselIndex', () => {
  it('starts at 0 and wraps forward', () => {
    const { result } = renderHook(() => useCarouselIndex(3));
    expect(result.current.index).toBe(0);
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.index).toBe(0);
  });

  it('wraps backward', () => {
    const { result } = renderHook(() => useCarouselIndex(3));
    act(() => result.current.prev());
    expect(result.current.index).toBe(2);
  });

  it('goTo jumps to a specific index', () => {
    const { result } = renderHook(() => useCarouselIndex(3));
    act(() => result.current.goTo(2));
    expect(result.current.index).toBe(2);
  });

  it('is a safe no-op when length is 0', () => {
    const { result } = renderHook(() => useCarouselIndex(0));
    expect(result.current.index).toBe(0);
    act(() => result.current.next());
    expect(result.current.index).toBe(0);
  });
});

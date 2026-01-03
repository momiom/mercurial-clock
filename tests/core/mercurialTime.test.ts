import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { createMercurialTimeStore } from '../../src/lib/core/mercurialTime';
import { DEFAULT_SETTINGS } from '../../src/lib/core/types';

describe('MercurialTimeStore', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;

    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });

    // Mock cancelAnimationFrame
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    // Mock Date.now for predictable testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // Helper to advance animation frames
  const flushRaf = (time = 0) => {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach((cb) => cb(time));
  };

  it('初期状態で rate はデフォルト値', () => {
    const store = createMercurialTimeStore(DEFAULT_SETTINGS.rate);
    const state = get(store);
    expect(state.rate).toBe(DEFAULT_SETTINGS.rate);
  });

  it('初期状態で isRunning は true', () => {
    const store = createMercurialTimeStore(1.0);
    const state = get(store);
    expect(state.isRunning).toBe(true);
  });

  it('displayTime と realTime が存在する', () => {
    const store = createMercurialTimeStore(1.0);
    const state = get(store);
    expect(state.displayTime).toBeInstanceOf(Date);
    expect(state.realTime).toBeInstanceOf(Date);
  });

  it('setRate で倍率を変更できる', () => {
    const store = createMercurialTimeStore(1.0);
    store.setRate(2.0);
    expect(get(store).rate).toBe(2.0);
  });

  it('setRate で時刻がリセットされる', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
    const store = createMercurialTimeStore(1.0);

    // 時間を進める
    vi.advanceTimersByTime(10000); // 10秒進める
    flushRaf();

    // setRate を呼ぶと時刻がリセットされる
    const beforeReset = get(store).displayTime;
    store.setRate(2.0);
    const afterReset = get(store).displayTime;

    // リセット後は現在の実時刻に近い値になる
    expect(afterReset.getTime()).toBeGreaterThan(beforeReset.getTime());
  });

  it('reset で時刻が現在時刻にリセットされる', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
    const store = createMercurialTimeStore(2.0);

    // 時間を進める
    vi.advanceTimersByTime(10000);
    flushRaf();

    store.reset();
    const state = get(store);

    // リセット後は表示時刻と実時刻が同じになる
    expect(state.displayTime.getTime()).toBeCloseTo(
      state.realTime.getTime(),
      -2,
    );
  });

  it('stop で isRunning が false になる', () => {
    const store = createMercurialTimeStore(1.0);
    store.stop();
    expect(get(store).isRunning).toBe(false);
  });

  it('start で isRunning が true になる', () => {
    const store = createMercurialTimeStore(1.0);
    store.stop();
    store.start();
    expect(get(store).isRunning).toBe(true);
  });

  it('destroy でリソースが解放される', () => {
    const store = createMercurialTimeStore(1.0);
    // destroy を呼んでもエラーにならない
    expect(() => store.destroy()).not.toThrow();
    // 複数回呼んでもエラーにならない
    expect(() => store.destroy()).not.toThrow();
  });

  it('rate=2.0 で時間が2倍速で進む', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
    const store = createMercurialTimeStore(2.0);
    const initialDisplayTime = get(store).displayTime.getTime();

    // 1秒進める
    vi.advanceTimersByTime(1000);
    flushRaf();

    const newDisplayTime = get(store).displayTime.getTime();
    const elapsed = newDisplayTime - initialDisplayTime;

    // rate=2.0 なので 2秒分進むはず
    expect(elapsed).toBeCloseTo(2000, -2);
  });
});

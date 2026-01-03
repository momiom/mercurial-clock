import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { createSettingsStore } from '../../src/lib/stores/settings';
import { DEFAULT_SETTINGS } from '../../src/lib/core/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('settings store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('初期値はデフォルト設定', () => {
    const settings = createSettingsStore();
    expect(get(settings)).toEqual(DEFAULT_SETTINGS);
  });

  it('localStorage に保存された値で初期化される', () => {
    const saved = { ...DEFAULT_SETTINGS, rate: 2.0 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saved));

    const settings = createSettingsStore();
    expect(get(settings).rate).toBe(2.0);
  });

  it('set で値を更新できる', () => {
    const settings = createSettingsStore();
    const newSettings = { ...DEFAULT_SETTINGS, rate: 1.5 };

    settings.set(newSettings);
    expect(get(settings)).toEqual(newSettings);
  });

  it('set で localStorage に自動保存される', () => {
    const settings = createSettingsStore();
    const newSettings = { ...DEFAULT_SETTINGS, rate: 1.5 };

    settings.set(newSettings);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('update で値を更新できる', () => {
    const settings = createSettingsStore();

    settings.update((s) => ({ ...s, showSecondHand: true }));
    expect(get(settings).showSecondHand).toBe(true);
  });

  it('update で localStorage に自動保存される', () => {
    const settings = createSettingsStore();

    settings.update((s) => ({ ...s, showSecondHand: true }));
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('reset でデフォルト値に戻る', () => {
    const settings = createSettingsStore();

    settings.set({ ...DEFAULT_SETTINGS, rate: 5.0 });
    settings.reset();

    expect(get(settings)).toEqual(DEFAULT_SETTINGS);
  });

  it('reset で localStorage も更新される', () => {
    const settings = createSettingsStore();

    settings.set({ ...DEFAULT_SETTINGS, rate: 5.0 });
    vi.clearAllMocks();
    settings.reset();

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('subscribe で値の変更を監視できる', () => {
    const settings = createSettingsStore();
    const values: number[] = [];

    const unsubscribe = settings.subscribe((s) => values.push(s.rate));

    settings.update((s) => ({ ...s, rate: 2.0 }));
    settings.update((s) => ({ ...s, rate: 3.0 }));

    unsubscribe();

    // 初期値 + 2回の更新
    expect(values).toEqual([DEFAULT_SETTINGS.rate, 2.0, 3.0]);
  });
});

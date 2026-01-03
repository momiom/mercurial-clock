import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeSettings,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEY,
} from '../../src/lib/utils/storage';
import { DEFAULT_SETTINGS, RATE_MIN, RATE_MAX } from '../../src/lib/core/types';

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

describe('normalizeSettings', () => {
  it('正常なデータはそのまま返す', () => {
    const input = {
      rate: 1.5,
      showSecondHand: true,
      showNumbers: false,
      showDigitalTime: true,
      theme: 'classic' as const,
      colorMode: 'dark' as const,
    };
    const result = normalizeSettings(input);
    expect(result).toEqual(input);
  });

  it('rate が範囲外（上限超え）なら clamp する', () => {
    const input = { ...DEFAULT_SETTINGS, rate: 15.0 };
    const result = normalizeSettings(input);
    expect(result.rate).toBe(RATE_MAX);
  });

  it('rate が範囲外（下限未満）なら clamp する', () => {
    const input = { ...DEFAULT_SETTINGS, rate: 0.05 };
    const result = normalizeSettings(input);
    expect(result.rate).toBe(RATE_MIN);
  });

  it('rate が文字列なら数値に変換', () => {
    const input = { ...DEFAULT_SETTINGS, rate: '1.5' as unknown as number };
    const result = normalizeSettings(input);
    expect(result.rate).toBe(1.5);
  });

  it('rate が NaN ならデフォルト値', () => {
    const input = { ...DEFAULT_SETTINGS, rate: NaN };
    const result = normalizeSettings(input);
    expect(result.rate).toBe(DEFAULT_SETTINGS.rate);
  });

  it('rate が文字列で数値に変換できない場合はデフォルト値', () => {
    const input = { ...DEFAULT_SETTINGS, rate: 'invalid' as unknown as number };
    const result = normalizeSettings(input);
    expect(result.rate).toBe(DEFAULT_SETTINGS.rate);
  });

  it('未知のプロパティは無視', () => {
    const input = {
      ...DEFAULT_SETTINGS,
      unknownProp: 'should be ignored',
    };
    const result = normalizeSettings(input);
    expect(result).not.toHaveProperty('unknownProp');
    expect(result.rate).toBe(DEFAULT_SETTINGS.rate);
  });

  it('必須プロパティが欠けていればデフォルト補完', () => {
    const input = { rate: 2.0 };
    const result = normalizeSettings(input);
    expect(result.rate).toBe(2.0);
    expect(result.showSecondHand).toBe(DEFAULT_SETTINGS.showSecondHand);
    expect(result.showNumbers).toBe(DEFAULT_SETTINGS.showNumbers);
    expect(result.theme).toBe(DEFAULT_SETTINGS.theme);
  });

  it('null なら完全なデフォルト', () => {
    const result = normalizeSettings(null);
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('undefined なら完全なデフォルト', () => {
    const result = normalizeSettings(undefined);
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('colorMode が無効な値ならデフォルト', () => {
    const input = {
      ...DEFAULT_SETTINGS,
      colorMode: 'invalid' as unknown as 'system' | 'light' | 'dark',
    };
    const result = normalizeSettings(input);
    expect(result.colorMode).toBe(DEFAULT_SETTINGS.colorMode);
  });

  it('theme が無効な値ならデフォルト', () => {
    const input = {
      ...DEFAULT_SETTINGS,
      theme: 'modern' as unknown as 'classic',
    };
    const result = normalizeSettings(input);
    expect(result.theme).toBe(DEFAULT_SETTINGS.theme);
  });
});

describe('loadFromStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('localStorage が空ならデフォルト値を返す', () => {
    const result = loadFromStorage();
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('正常な JSON を読み込める', () => {
    const saved = { ...DEFAULT_SETTINGS, rate: 2.0 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saved));
    const result = loadFromStorage();
    expect(result.rate).toBe(2.0);
  });

  it('壊れた JSON でもデフォルト値を返す', () => {
    localStorageMock.getItem.mockReturnValueOnce('{ invalid json }');
    const result = loadFromStorage();
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('localStorage がエラーを投げてもクラッシュしない', () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('localStorage access denied');
    });
    const result = loadFromStorage();
    expect(result).toEqual(DEFAULT_SETTINGS);
  });
});

describe('saveToStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('設定を localStorage に保存できる', () => {
    const settings = { ...DEFAULT_SETTINGS, rate: 1.5 };
    saveToStorage(settings);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(settings),
    );
  });

  it('localStorage がエラーを投げてもクラッシュしない', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('localStorage quota exceeded');
    });
    expect(() => saveToStorage(DEFAULT_SETTINGS)).not.toThrow();
  });
});

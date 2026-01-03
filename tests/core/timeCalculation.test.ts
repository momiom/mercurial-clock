import { describe, it, expect } from 'vitest';
import { computeMercurialTime } from '../../src/lib/core/timeCalculation';

describe('computeMercurialTime', () => {
  it('rate=1.0 で経過時間がそのまま反映される', () => {
    const base = 1000;
    const now = 2000; // 1秒経過
    const result = computeMercurialTime(base, base, now, 1.0);
    expect(result).toBe(2000);
  });

  it('rate=2.0 で経過時間が2倍になる', () => {
    const base = 1000;
    const now = 2000; // 実際は1秒経過
    const result = computeMercurialTime(base, base, now, 2.0);
    expect(result).toBe(3000); // 表示上は2秒経過
  });

  it('rate=0.5 で経過時間が半分になる', () => {
    const base = 1000;
    const now = 3000; // 実際は2秒経過
    const result = computeMercurialTime(base, base, now, 0.5);
    expect(result).toBe(2000); // 表示上は1秒経過
  });

  it('baseDisplayMs が異なる場合も正しく計算される', () => {
    const baseReal = 1000;
    const baseDisplay = 5000; // 表示時刻は別の値から開始
    const now = 2000;
    const result = computeMercurialTime(baseReal, baseDisplay, now, 1.0);
    expect(result).toBe(6000);
  });

  it('rate=1.1 (デフォルト) で10%速く進む', () => {
    const base = 0;
    const now = 1000; // 1秒経過
    const result = computeMercurialTime(base, base, now, 1.1);
    expect(result).toBe(1100); // 1.1秒分進む
  });

  it('経過時間が0の場合は baseDisplayMs を返す', () => {
    const baseReal = 1000;
    const baseDisplay = 5000;
    const now = 1000; // 経過時間0
    const result = computeMercurialTime(baseReal, baseDisplay, now, 2.0);
    expect(result).toBe(5000);
  });
});

/**
 * MercurialTimeStore
 * 時間計算ロジックと rAF スケジューリングを管理するストア
 */
import { writable, type Readable } from 'svelte/store';
import { type MercurialTimeState } from './types';
import { computeMercurialTime } from './timeCalculation';

/**
 * MercurialTimeStore のアクション
 */
export interface MercurialTimeActions {
  /** 倍率を変更（時刻もリセット） */
  setRate: (rate: number) => void;
  /** 表示時刻を実時刻にリセット */
  reset: () => void;
  /** 時計を開始 */
  start: () => void;
  /** 時計を停止 */
  stop: () => void;
  /** リソースを解放 */
  destroy: () => void;
}

/**
 * MercurialTimeStore の型
 */
export type MercurialTimeStore = Readable<MercurialTimeState> &
  MercurialTimeActions;

/**
 * MercurialTimeStore を作成する
 *
 * @param initialRate - 初期倍率
 * @returns ストアとアクション
 */
export function createMercurialTimeStore(
  initialRate: number,
): MercurialTimeStore {
  // 内部状態
  let baseRealMs = Date.now();
  let baseDisplayMs = baseRealMs;
  let rate = initialRate;
  let isRunning = true;
  let rafId: number | null = null;

  /**
   * 現在の状態を計算して返す
   */
  const computeState = (): MercurialTimeState => {
    const nowRealMs = Date.now();
    const displayMs = computeMercurialTime(
      baseRealMs,
      baseDisplayMs,
      nowRealMs,
      rate,
    );

    return {
      displayTime: new Date(displayMs),
      realTime: new Date(nowRealMs),
      rate,
      isRunning,
    };
  };

  // writable ストアを作成
  const { subscribe, set } = writable<MercurialTimeState>(computeState());

  /**
   * アニメーションフレームのコールバック
   */
  const tick = () => {
    if (!isRunning) return;
    set(computeState());
    rafId = requestAnimationFrame(tick);
  };

  /**
   * rAF ループを開始
   */
  const startLoop = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(tick);
  };

  /**
   * rAF ループを停止
   */
  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  // 初期起動
  startLoop();

  // アクション
  const setRate = (newRate: number) => {
    // 時刻をリセット
    const now = Date.now();
    baseRealMs = now;
    baseDisplayMs = now;
    rate = newRate;
    set(computeState());
  };

  const reset = () => {
    const now = Date.now();
    baseRealMs = now;
    baseDisplayMs = now;
    set(computeState());
  };

  const start = () => {
    if (isRunning) return;
    isRunning = true;
    startLoop();
    set(computeState());
  };

  const stop = () => {
    if (!isRunning) return;
    isRunning = false;
    stopLoop();
    set(computeState());
  };

  const destroy = () => {
    stopLoop();
  };

  return {
    subscribe,
    setRate,
    reset,
    start,
    stop,
    destroy,
  };
}

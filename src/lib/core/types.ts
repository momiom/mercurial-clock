/**
 * Mercurial Clock - Core Type Definitions
 */

/**
 * 時間計算の状態
 */
export interface MercurialTimeState {
  /** 表示時刻 */
  displayTime: Date;
  /** 実時刻 */
  realTime: Date;
  /** 倍率 */
  rate: number;
  /** 動作中フラグ */
  isRunning: boolean;
}

/**
 * アプリケーション設定
 */
export interface Settings {
  /** 倍率（0.1〜10.0） */
  rate: number;
  /** 秒針を表示するか */
  showSecondHand: boolean;
  /** 数字（1〜12）を表示するか */
  showNumbers: boolean;
  /** デジタル時刻を表示するか */
  showDigitalTime: boolean;
  /** テーマ（現在は classic のみ） */
  theme: 'classic';
  /** カラーモード */
  colorMode: 'system' | 'light' | 'dark';
}

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: Settings = {
  rate: 1.1,
  showSecondHand: false,
  showNumbers: true,
  showDigitalTime: false,
  theme: 'classic',
  colorMode: 'system',
};

/**
 * 倍率の最小値
 */
export const RATE_MIN = 0.1;

/**
 * 倍率の最大値
 */
export const RATE_MAX = 10.0;

/**
 * 倍率のステップ
 */
export const RATE_STEP = 0.01;

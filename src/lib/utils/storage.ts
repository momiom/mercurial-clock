/**
 * localStorage ユーティリティ（正規化処理付き）
 */
import {
  type Settings,
  DEFAULT_SETTINGS,
  RATE_MIN,
  RATE_MAX,
} from '../core/types';

/**
 * localStorage のキー
 */
export const STORAGE_KEY = 'mercurial-clock-settings';

/**
 * 有効な colorMode の値
 */
const VALID_COLOR_MODES = ['system', 'light', 'dark'] as const;

/**
 * 有効な theme の値
 */
const VALID_THEMES = ['classic'] as const;

/**
 * 数値を範囲内に収める
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 壊れたデータを正規化して Settings オブジェクトを返す
 */
export function normalizeSettings(raw: unknown): Settings {
  // null/undefined の場合はデフォルト値を返す
  if (raw === null || raw === undefined) {
    return { ...DEFAULT_SETTINGS };
  }

  // オブジェクトでない場合もデフォルト値を返す
  if (typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const input = raw as Record<string, unknown>;

  // rate の正規化
  let rate = DEFAULT_SETTINGS.rate;
  if (input.rate !== undefined) {
    const parsed =
      typeof input.rate === 'string' ? parseFloat(input.rate) : input.rate;
    if (typeof parsed === 'number' && !isNaN(parsed)) {
      rate = clamp(parsed, RATE_MIN, RATE_MAX);
    }
  }

  // boolean フィールドの正規化
  const showSecondHand =
    typeof input.showSecondHand === 'boolean'
      ? input.showSecondHand
      : DEFAULT_SETTINGS.showSecondHand;

  const showNumbers =
    typeof input.showNumbers === 'boolean'
      ? input.showNumbers
      : DEFAULT_SETTINGS.showNumbers;

  const showDigitalTime =
    typeof input.showDigitalTime === 'boolean'
      ? input.showDigitalTime
      : DEFAULT_SETTINGS.showDigitalTime;

  // theme の正規化
  const theme = VALID_THEMES.includes(input.theme as 'classic')
    ? (input.theme as 'classic')
    : DEFAULT_SETTINGS.theme;

  // colorMode の正規化
  const colorMode = VALID_COLOR_MODES.includes(
    input.colorMode as 'system' | 'light' | 'dark',
  )
    ? (input.colorMode as 'system' | 'light' | 'dark')
    : DEFAULT_SETTINGS.colorMode;

  return {
    rate,
    showSecondHand,
    showNumbers,
    showDigitalTime,
    theme,
    colorMode,
  };
}

/**
 * localStorage から設定を読み込む
 * エラーが発生した場合はデフォルト値を返す
 */
export function loadFromStorage(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(stored);
    return normalizeSettings(parsed);
  } catch {
    // JSON パースエラーや localStorage アクセスエラー
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * 設定を localStorage に保存する
 * エラーが発生した場合は静かに失敗する
 */
export function saveToStorage(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage アクセスエラー（容量超過など）
    // 静かに失敗する
  }
}

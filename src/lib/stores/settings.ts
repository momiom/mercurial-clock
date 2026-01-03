/**
 * 設定ストア
 * localStorage への自動保存機能付き
 */
import { writable, type Writable } from 'svelte/store';
import { type Settings, DEFAULT_SETTINGS } from '../core/types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

/**
 * reset メソッドを追加した Settings ストアの型
 */
export interface SettingsStore extends Writable<Settings> {
  /** 設定をデフォルト値にリセット */
  reset: () => void;
}

/**
 * 設定ストアを作成する
 * localStorage から初期値を読み込み、変更時に自動保存する
 */
export function createSettingsStore(): SettingsStore {
  // localStorage から初期値を読み込む
  const initialValue = loadFromStorage();

  // writable ストアを作成
  const {
    subscribe,
    set: baseSet,
    update: baseUpdate,
  } = writable<Settings>(initialValue);

  // set をラップして localStorage に保存
  const set = (value: Settings) => {
    baseSet(value);
    saveToStorage(value);
  };

  // update をラップして localStorage に保存
  const update = (updater: (value: Settings) => Settings) => {
    baseUpdate((current) => {
      const newValue = updater(current);
      saveToStorage(newValue);
      return newValue;
    });
  };

  // デフォルト値にリセット
  const reset = () => {
    set({ ...DEFAULT_SETTINGS });
  };

  return {
    subscribe,
    set,
    update,
    reset,
  };
}

/**
 * シングルトンの設定ストア
 * アプリケーション全体で共有される
 */
export const settings = createSettingsStore();

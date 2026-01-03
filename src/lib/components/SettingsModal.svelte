<script lang="ts">
  /**
   * 設定モーダルコンポーネント
   * アクセシビリティ対応: フォーカストラップ、Escape キー、ARIA 属性
   */
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { RATE_MIN, RATE_MAX, RATE_STEP, type Settings } from '../core/types';
  import Button from './Button.svelte';

  export let settings: Settings;

  const dispatch = createEventDispatcher<{
    apply: Settings;
    cancel: void;
  }>();

  // ローカル編集用のコピー
  let localRate = settings.rate;
  let localShowSecondHand = settings.showSecondHand;
  let localShowNumbers = settings.showNumbers;
  let localShowDigitalTime = settings.showDigitalTime;
  let localColorMode = settings.colorMode;

  // 参照
  let modalElement: HTMLDivElement;
  let rateInputElement: HTMLInputElement;

  // フォーカス可能な要素を取得
  function getFocusableElements(): HTMLElement[] {
    if (!modalElement) return [];
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(modalElement.querySelectorAll<HTMLElement>(selector));
  }

  // フォーカストラップ
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      dispatch('cancel');
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  // オーバーレイクリック
  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      dispatch('cancel');
    }
  }

  // 適用ボタン
  function handleApply() {
    dispatch('apply', {
      ...settings,
      rate: localRate,
      showSecondHand: localShowSecondHand,
      showNumbers: localShowNumbers,
      showDigitalTime: localShowDigitalTime,
      colorMode: localColorMode,
    });
  }

  // マウント時に初期フォーカス設定
  onMount(() => {
    // 現在のフォーカスを保存
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 倍率入力にフォーカス
    if (rateInputElement) {
      rateInputElement.focus();
    }

    // キーボードイベントを追加
    document.addEventListener('keydown', handleKeyDown);

    // アンマウント時にフォーカスを戻す
    return () => {
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
</script>

<div
  class="modal-overlay"
  on:click={handleOverlayClick}
  on:keydown={handleKeyDown}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabindex="-1"
>
  <div class="modal-content" bind:this={modalElement}>
    <h2 id="modal-title" class="modal-title">Settings</h2>

    <!-- 倍率設定 -->
    <div class="form-group">
      <label for="rate-input" class="label">Rate</label>
      <input
        id="rate-input"
        type="number"
        min={RATE_MIN}
        max={RATE_MAX}
        step={RATE_STEP}
        bind:value={localRate}
        bind:this={rateInputElement}
        class="input"
      />
      <p class="hint">1.1 = 10% faster, 0.9 = 10% slower</p>
    </div>

    <!-- 表示設定 -->
    <div class="form-group">
      <span class="label">Display Options</span>

      <label class="checkbox-label">
        <input type="checkbox" bind:checked={localShowSecondHand} />
        Show second hand
      </label>

      <label class="checkbox-label">
        <input type="checkbox" bind:checked={localShowNumbers} />
        Show numbers (1-12)
      </label>

      <label class="checkbox-label">
        <input type="checkbox" bind:checked={localShowDigitalTime} />
        Show digital time
      </label>
    </div>

    <!-- カラーモード -->
    <div class="form-group">
      <span class="label">Color Mode</span>
      <div class="radio-group">
        <label class="radio-label">
          <input
            type="radio"
            name="colorMode"
            value="system"
            bind:group={localColorMode}
          />
          System
        </label>
        <label class="radio-label">
          <input
            type="radio"
            name="colorMode"
            value="light"
            bind:group={localColorMode}
          />
          Light
        </label>
        <label class="radio-label">
          <input
            type="radio"
            name="colorMode"
            value="dark"
            bind:group={localColorMode}
          />
          Dark
        </label>
      </div>
    </div>

    <!-- ボタン -->
    <div class="button-group">
      <Button variant="cancel" on:click={() => dispatch('cancel')}>
        Cancel
      </Button>
      <Button variant="success" on:click={handleApply}>Apply</Button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--modal-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--modal-bg);
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.5rem;
    color: var(--text-color);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color);
  }

  .input {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: 2px solid var(--input-border);
    border-radius: 6px;
    background-color: var(--input-bg);
    color: var(--text-color);
    box-sizing: border-box;
  }

  .input:focus {
    outline: none;
    border-color: var(--btn-primary);
  }

  .hint {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-top: 8px;
    margin-bottom: 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    color: var(--text-color);
  }

  .checkbox-label input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .radio-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--text-color);
  }

  .radio-label input[type='radio'] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .button-group {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }
</style>

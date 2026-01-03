<script lang="ts">
  /**
   * Mercurial Clock - ルートコンポーネント
   */
  import { onDestroy } from 'svelte';
  import { createMercurialTimeStore } from './lib/core/mercurialTime';
  import { settings } from './lib/stores/settings';
  import type { Settings } from './lib/core/types';
  import ClockContainer from './lib/components/clock/ClockContainer.svelte';
  import SettingsModal from './lib/components/SettingsModal.svelte';
  import Button from './lib/components/Button.svelte';

  // 時間ストアを作成
  const timeStore = createMercurialTimeStore($settings.rate);

  // モーダル開閉状態
  let isModalOpen = false;

  /**
   * カラーモードを適用
   */
  function applyColorMode(mode: 'system' | 'light' | 'dark') {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (mode !== 'system') {
      root.classList.add(mode);
    }
  }

  /**
   * 時刻表示用フォーマット
   */
  function formatTime(date: Date): string {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * リセットハンドラ
   */
  function handleReset() {
    timeStore.reset();
  }

  /**
   * 設定適用ハンドラ
   */
  function handleApplySettings(event: CustomEvent<Settings>) {
    const newSettings = event.detail;
    settings.set(newSettings);

    // 倍率が変更された場合は時間ストアも更新
    if (newSettings.rate !== $timeStore.rate) {
      timeStore.setRate(newSettings.rate);
    }

    isModalOpen = false;
  }

  /**
   * 設定キャンセルハンドラ
   */
  function handleCancelSettings() {
    isModalOpen = false;
  }

  // カラーモードの反映（リアクティブ）
  $: applyColorMode($settings.colorMode);

  // クリーンアップ
  onDestroy(() => {
    timeStore.destroy();
  });
</script>

<main class="app">
  <header class="header">
    <h1 class="title">Mercurial Clock</h1>
    <p class="rate-display">
      Rate: <strong>{$settings.rate.toFixed(2)}x</strong>
    </p>
  </header>

  <section class="clock-section">
    <ClockContainer
      time={$timeStore.displayTime}
      showSecondHand={$settings.showSecondHand}
      showNumbers={$settings.showNumbers}
      theme={$settings.theme}
    />

    {#if $settings.showDigitalTime}
      <p class="digital-time">{formatTime($timeStore.displayTime)}</p>
    {/if}
  </section>

  <nav class="button-group">
    <Button variant="danger" on:click={handleReset}>Reset</Button>
    <Button variant="primary" on:click={() => (isModalOpen = true)}>
      Settings
    </Button>
  </nav>
</main>

{#if isModalOpen}
  <SettingsModal
    settings={$settings}
    on:apply={handleApplySettings}
    on:cancel={handleCancelSettings}
  />
{/if}

<style>
  .app {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    gap: 20px;
  }

  .header {
    text-align: center;
  }

  .title {
    margin-bottom: 8px;
    font-size: 1.5rem;
    color: var(--text-color);
  }

  .rate-display {
    color: var(--text-muted);
    font-size: 1rem;
  }

  .clock-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    flex: 1;
    justify-content: center;
  }

  .digital-time {
    font-size: 1.5rem;
    font-family: monospace;
    color: var(--text-color);
  }

  .button-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>

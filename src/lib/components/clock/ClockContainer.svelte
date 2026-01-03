<script lang="ts">
  /**
   * 時計コンテナコンポーネント
   * レスポンシブサイズの制御とテーマ選択を担当
   */
  import ClassicClock from './themes/ClassicClock.svelte';

  export let time: Date;
  export let showSecondHand: boolean;
  export let showNumbers: boolean;
  export let theme = 'classic' as const;

  // theme は将来のテーマ拡張用に型安全性を確保
  // 現時点では 'classic' のみ
  $: _theme = theme;
</script>

<div class="clock-container">
  {#if _theme === 'classic'}
    <ClassicClock {time} {showSecondHand} {showNumbers} />
  {/if}
</div>

<style>
  .clock-container {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
  }

  /* レスポンシブ対応 */
  @media (max-width: 480px) {
    .clock-container {
      max-width: min(80vw, 300px);
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    .clock-container {
      max-width: min(60vw, 400px);
    }
  }
</style>

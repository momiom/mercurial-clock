<script lang="ts">
  /**
   * Classic テーマの時計コンポーネント
   * SVG でアナログ時計を描画
   */

  export let time: Date;
  export let showSecondHand: boolean;
  export let showNumbers: boolean;

  // SVG のサイズ定数
  const SIZE = 300;
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 2 - 20;

  /**
   * 角度計算
   * 12時を0度（実際は-90度）として時計回りに角度を計算
   */
  function getAngle(value: number, max: number): number {
    return (value / max) * 360 - 90;
  }

  /**
   * 極座標から直交座標への変換
   */
  function polarToCartesian(
    angle: number,
    radius: number,
  ): { x: number; y: number } {
    const rad = (angle * Math.PI) / 180;
    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
    };
  }

  // 現在時刻から各要素を取得（リアクティブ）
  $: hours = time.getHours() % 12;
  $: minutes = time.getMinutes();
  $: seconds = time.getSeconds();
  $: milliseconds = time.getMilliseconds();

  // 滑らかな動きのための角度計算（ミリ秒・秒・分を考慮）
  $: secondAngle = getAngle(seconds + milliseconds / 1000, 60);
  $: minuteAngle = getAngle(minutes + seconds / 60, 60);
  $: hourAngle = getAngle(hours + minutes / 60, 12);

  // 各針の終点座標を計算
  $: secondHand = polarToCartesian(secondAngle, RADIUS * 0.85);
  $: minuteHand = polarToCartesian(minuteAngle, RADIUS * 0.7);
  $: hourHand = polarToCartesian(hourAngle, RADIUS * 0.5);

  // 目盛りを生成（60個）
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = getAngle(i, 60);
    const isMajor = i % 5 === 0;
    const outerRadius = RADIUS - 5;
    const innerRadius = isMajor ? RADIUS - 20 : RADIUS - 12;

    const outer = polarToCartesian(angle, outerRadius);
    const inner = polarToCartesian(angle, innerRadius);

    return { id: i, inner, outer, isMajor };
  });

  // 数字を生成（1〜12）
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const angle = getAngle(num, 12);
    const pos = polarToCartesian(angle, RADIUS - 38);
    return { num, x: pos.x, y: pos.y };
  });
</script>

<svg
  viewBox="0 0 {SIZE} {SIZE}"
  class="clock"
  role="img"
  aria-label="Analog clock"
>
  <!-- 背景円（文字盤） -->
  <circle
    cx={CENTER}
    cy={CENTER}
    r={RADIUS}
    class="clock-face"
    fill="var(--clock-bg)"
    stroke="var(--clock-stroke)"
    stroke-width="4"
  />

  <!-- 目盛り -->
  {#each ticks as tick (tick.id)}
    <line
      x1={tick.inner.x}
      y1={tick.inner.y}
      x2={tick.outer.x}
      y2={tick.outer.y}
      stroke="var(--clock-stroke)"
      stroke-width={tick.isMajor ? 3 : 1}
      stroke-linecap="round"
    />
  {/each}

  <!-- 数字（トグル可能） -->
  {#if showNumbers}
    {#each numbers as { num, x, y } (num)}
      <text
        {x}
        {y}
        text-anchor="middle"
        dominant-baseline="central"
        class="clock-number"
        fill="var(--clock-stroke)"
      >
        {num}
      </text>
    {/each}
  {/if}

  <!-- 時針 -->
  <line
    x1={CENTER}
    y1={CENTER}
    x2={hourHand.x}
    y2={hourHand.y}
    stroke="var(--clock-stroke)"
    stroke-width="6"
    stroke-linecap="round"
  />

  <!-- 分針 -->
  <line
    x1={CENTER}
    y1={CENTER}
    x2={minuteHand.x}
    y2={minuteHand.y}
    stroke="var(--clock-stroke)"
    stroke-width="4"
    stroke-linecap="round"
  />

  <!-- 秒針（トグル可能） -->
  {#if showSecondHand}
    <line
      x1={CENTER}
      y1={CENTER}
      x2={secondHand.x}
      y2={secondHand.y}
      stroke="var(--second-hand)"
      stroke-width="2"
      stroke-linecap="round"
    />
  {/if}

  <!-- 中心のドット -->
  <circle cx={CENTER} cy={CENTER} r="8" fill="var(--clock-stroke)" />
  <circle cx={CENTER} cy={CENTER} r="4" fill="var(--second-hand)" />
</svg>

<style>
  .clock {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  .clock-number {
    font-size: 20px;
    font-weight: bold;
    font-family: Arial, sans-serif;
  }
</style>

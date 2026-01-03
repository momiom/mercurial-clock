/**
 * 表示時刻を計算する純粋関数
 *
 * 数式: 表示時刻 = baseDisplayMs + (nowRealMs - baseRealMs) × rate
 *
 * @param baseRealMs - 基準となる実時間（ms）
 * @param baseDisplayMs - 基準となる表示時間（ms）
 * @param nowRealMs - 現在の実時間（ms）
 * @param rate - 倍率
 * @returns 表示時刻（ms）
 */
export function computeMercurialTime(
  baseRealMs: number,
  baseDisplayMs: number,
  nowRealMs: number,
  rate: number,
): number {
  const elapsedReal = nowRealMs - baseRealMs;
  const elapsedDisplay = elapsedReal * rate;
  return baseDisplayMs + elapsedDisplay;
}

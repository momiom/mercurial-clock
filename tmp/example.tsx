import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * Mercurial Clock - 仮想時計
 *
 * 東京大学・伴祐樹らの研究に基づく仮想時計の実装
 * 時計の針の進む速度を倍率で制御し、作業効率向上を促す
 *
 * 数式: 表示時刻 = T0 + t × rate
 *   - T0: 開始時刻
 *   - t: 実際の経過時間
 *   - rate: 設定倍率
 */
export default function MercurialClock() {
  // 時計のサイズ定数
  const SIZE = 300;
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 2 - 20;

  // 状態管理
  const [rate, setRate] = useState(1.1); // 現在の倍率
  const [tempRate, setTempRate] = useState("1.1"); // モーダル入力用の一時倍率
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 表示設定
  const [showSecondHand, setShowSecondHand] = useState(false); // 秒針の表示（デフォルト非表示）
  const [showNumbers, setShowNumbers] = useState(true); // 数字の表示
  const [showDigitalTime, setShowDigitalTime] = useState(false); // デジタル表示（デフォルト非表示）

  // モーダル用の一時設定
  const [tempShowSecondHand, setTempShowSecondHand] = useState(false);
  const [tempShowNumbers, setTempShowNumbers] = useState(true);
  const [tempShowDigitalTime, setTempShowDigitalTime] = useState(false);

  // 開始時刻の参照（リレンダリングで変化しない）
  const startTimeRef = useRef(Date.now()); // 開始時のタイムスタンプ(ms)
  const startDateRef = useRef(new Date()); // 開始時のDateオブジェクト

  // アニメーションフレームID
  const animationRef = useRef(null);

  /**
   * 時刻を更新する関数
   * requestAnimationFrameでループしつつ、実際の経過時間を元に計算
   */
  const updateTime = useCallback(() => {
    const now = Date.now();
    const elapsedMs = now - startTimeRef.current;

    // 経過時間に倍率を適用: t × rate
    const adjustedElapsedMs = elapsedMs * rate;

    // 表示時刻 = T0 + (t × rate)
    const adjustedTime = new Date(
      startDateRef.current.getTime() + adjustedElapsedMs,
    );
    setCurrentTime(adjustedTime);

    // 次のフレームをリクエスト
    animationRef.current = requestAnimationFrame(updateTime);
  }, [rate]);

  // アニメーションループの開始と終了
  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateTime);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateTime]);

  /**
   * 経過時間リセットハンドラ
   * 開始時刻を現在の実時刻にリセット
   */
  const handleReset = () => {
    const now = new Date();
    startTimeRef.current = Date.now();
    startDateRef.current = now;
    setCurrentTime(now);
  };

  /**
   * 倍率変更ハンドラ
   * 変更時に経過時間をリセット
   */
  const handleRateChange = () => {
    const newRate = parseFloat(tempRate);
    if (!isNaN(newRate) && newRate >= 1) {
      // 経過時間をリセット（実時刻に戻す）
      const now = new Date();
      startTimeRef.current = Date.now();
      startDateRef.current = now;
      setRate(newRate);

      // 表示設定を適用
      setShowSecondHand(tempShowSecondHand);
      setShowNumbers(tempShowNumbers);
      setShowDigitalTime(tempShowDigitalTime);

      setIsModalOpen(false);
    }
  };

  /**
   * モーダルを開くハンドラ
   * 現在の設定を一時変数にコピー
   */
  const handleOpenModal = () => {
    setTempRate(rate.toString());
    setTempShowSecondHand(showSecondHand);
    setTempShowNumbers(showNumbers);
    setTempShowDigitalTime(showDigitalTime);
    setIsModalOpen(true);
  };

  /**
   * 角度計算
   * 12時を0度（実際は-90度）として時計回りに角度を計算
   * @param value - 現在の値（秒、分、時）
   * @param max - 最大値（60または12）
   * @returns 角度（度）
   */
  const getAngle = (value, max) => {
    // 12時方向を基準にするため-90度オフセット
    return (value / max) * 360 - 90;
  };

  /**
   * 極座標から直交座標への変換
   * @param angle - 角度（度）
   * @param radius - 半径
   * @returns {x, y} 座標
   */
  const polarToCartesian = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
    };
  };

  // 現在時刻から各要素を取得
  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const milliseconds = currentTime.getMilliseconds();

  // 滑らかな動きのための角度計算（ミリ秒・秒・分を考慮）
  const secondAngle = getAngle(seconds + milliseconds / 1000, 60);
  const minuteAngle = getAngle(minutes + seconds / 60, 60);
  const hourAngle = getAngle(hours + minutes / 60, 12);

  // 各針の終点座標を計算
  const secondHand = polarToCartesian(secondAngle, RADIUS * 0.85);
  const minuteHand = polarToCartesian(minuteAngle, RADIUS * 0.7);
  const hourHand = polarToCartesian(hourAngle, RADIUS * 0.5);

  // 目盛りを生成（60個）
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const angle = getAngle(i, 60);
    const isMajor = i % 5 === 0; // 5分単位は大きな目盛り
    const outerRadius = RADIUS - 5;
    const innerRadius = isMajor ? RADIUS - 20 : RADIUS - 12;

    const outer = polarToCartesian(angle, outerRadius);
    const inner = polarToCartesian(angle, innerRadius);

    ticks.push(
      <line
        key={`tick-${i}`}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke="#333"
        strokeWidth={isMajor ? 3 : 1}
        strokeLinecap="round"
      />,
    );
  }

  // 数字を生成（1〜12）
  const numbers = [];
  for (let i = 1; i <= 12; i++) {
    const angle = getAngle(i, 12);
    const pos = polarToCartesian(angle, RADIUS - 38);
    numbers.push(
      <text
        key={`num-${i}`}
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
        fontWeight="bold"
        fill="#333"
        fontFamily="Arial, sans-serif"
      >
        {i}
      </text>,
    );
  }

  /**
   * 時刻表示用フォーマット
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // スタイル定義
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f5f5f5",
      minHeight: "100vh",
    },
    title: {
      marginBottom: "10px",
      color: "#333",
    },
    rateDisplay: {
      marginBottom: "20px",
      color: "#666",
    },
    svg: {
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
    },
    digitalTime: {
      marginTop: "20px",
      fontSize: "24px",
      fontFamily: "monospace",
      color: "#333",
    },
    settingsButton: {
      padding: "12px 24px",
      fontSize: "16px",
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    resetButton: {
      padding: "12px 24px",
      fontSize: "16px",
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      minWidth: "300px",
    },
    modalTitle: {
      marginTop: 0,
      color: "#333",
    },
    inputLabel: {
      display: "block",
      marginBottom: "8px",
      color: "#666",
    },
    input: {
      width: "100%",
      padding: "10px",
      fontSize: "16px",
      border: "2px solid #ddd",
      borderRadius: "6px",
      boxSizing: "border-box",
    },
    inputHint: {
      fontSize: "12px",
      color: "#888",
      marginTop: "8px",
    },
    toggleLabel: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
      cursor: "pointer",
      fontSize: "14px",
      color: "#333",
    },
    checkbox: {
      width: "18px",
      height: "18px",
      marginRight: "10px",
      cursor: "pointer",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
    },
    cancelButton: {
      padding: "10px 20px",
      fontSize: "14px",
      backgroundColor: "#95a5a6",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    applyButton: {
      padding: "10px 20px",
      fontSize: "14px",
      backgroundColor: "#27ae60",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mercurial Clock</h1>
      <p style={styles.rateDisplay}>
        現在の倍率: <strong>{rate}x</strong>
      </p>

      {/* 時計本体（SVG） */}
      <svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* 背景円 */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="white"
          stroke="#333"
          strokeWidth="4"
        />

        {/* 目盛り */}
        {ticks}

        {/* 数字（表示設定がオンの場合のみ） */}
        {showNumbers && numbers}

        {/* 短針（時針） */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={hourHand.x}
          y2={hourHand.y}
          stroke="#333"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 長針（分針） */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={minuteHand.x}
          y2={minuteHand.y}
          stroke="#333"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* 秒針（表示設定がオンの場合のみ） */}
        {showSecondHand && (
          <line
            x1={CENTER}
            y1={CENTER}
            x2={secondHand.x}
            y2={secondHand.y}
            stroke="#e74c3c"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* 中心の円 */}
        <circle cx={CENTER} cy={CENTER} r="8" fill="#333" />
        <circle cx={CENTER} cy={CENTER} r="4" fill="#e74c3c" />
      </svg>

      {/* デジタル時刻表示（表示設定がオンの場合のみ） */}
      {showDigitalTime && (
        <p style={styles.digitalTime}>{formatTime(currentTime)}</p>
      )}

      {/* ボタン群 */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        {/* リセットボタン */}
        <button
          onClick={handleReset}
          style={styles.resetButton}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c0392b")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#e74c3c")}
        >
          🔄 リセット
        </button>

        {/* 設定ボタン */}
        <button
          onClick={handleOpenModal}
          style={styles.settingsButton}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#3498db")}
        >
          ⚙️ 設定
        </button>
      </div>

      {/* 設定モーダル */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>時計の設定</h2>

            {/* 倍率設定 */}
            <div style={{ marginBottom: "20px" }}>
              <label style={styles.inputLabel}>時間倍率（1以上の実数）</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                style={styles.input}
              />
              <p style={styles.inputHint}>
                例: 1.1 = 10%速く進む、1.5 = 50%速く進む
              </p>
            </div>

            {/* 表示設定 */}
            <div style={{ marginBottom: "20px" }}>
              <label style={styles.inputLabel}>表示項目</label>

              {/* 秒針の表示 */}
              <label style={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={tempShowSecondHand}
                  onChange={(e) => setTempShowSecondHand(e.target.checked)}
                  style={styles.checkbox}
                />
                秒針を表示
              </label>

              {/* 数字の表示 */}
              <label style={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={tempShowNumbers}
                  onChange={(e) => setTempShowNumbers(e.target.checked)}
                  style={styles.checkbox}
                />
                目盛りの数字を表示（1〜12）
              </label>

              {/* デジタル表示 */}
              <label style={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={tempShowDigitalTime}
                  onChange={(e) => setTempShowDigitalTime(e.target.checked)}
                  style={styles.checkbox}
                />
                デジタル時刻を表示
              </label>
            </div>

            <div style={styles.buttonGroup}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelButton}
              >
                キャンセル
              </button>
              <button onClick={handleRateChange} style={styles.applyButton}>
                適用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

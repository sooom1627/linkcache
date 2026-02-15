/**
 * カラーパレット
 *
 * プロジェクト全体で使用する色の単一参照元。
 * - Main: Slate-800
 * - Accent: 濃い青（blue-700/600）
 *
 * ## 必要なカラーパターン（プロジェクト分析結果）
 *
 * ### 1. 背景・サーフェス系
 * - screen / card / surface / surfaceSecondary / emptyState
 *
 * ### 2. メイン・プライマリ系
 * - main: Slate-800（CTAボタン、アクティブタブ、選択chip）
 * - mainHover: ホバー/アクティブ時
 *
 * ### 3. アクセント系
 * - accent: 濃い青（強調、リンク、空状態アイコン等）
 * - accentMuted: アクセントの控えめ版
 *
 * ### 4. テキスト系
 * - textPrimary / textSecondary / textMuted / textOnDark
 *
 * ### 5. アイコン・グラフィック系
 * - icon: Lucide, ActivityIndicator 等で hex が必要な箇所
 * - iconMuted / iconPlaceholder
 *
 * ### 6. ボーダー・区切り系
 * - border / borderLight
 *
 * ### 7. セマンティック（状態表示）
 * - success / error / warning / info
 *
 * ### 8. ステータス（triage: new/read_soon/stock/done）
 * - statusNew / statusReadSoon / statusStock / statusDone / statusDefault
 *
 * ### 9. UIオーバーレイ・モーダル系
 * - backdrop / handleIndicator / shadow
 *
 * ### 10. フォーム・ボタン変種
 * - disabled / danger / dangerDisabled
 *
 * ### 11. 外部連携（WebBrowser等）
 * - browserControls / browserToolbar
 */

// Tailwind参照: slate-800=#1e293b, blue-700=#1d4ed8, blue-600=#2563eb
const palette = {
  // === 1. 背景・サーフェス ===
  screen: "#f8fafc", // slate-50
  surface: "#ffffff",
  surfaceSecondary: "#f8fafc", // slate-50
  surfaceMuted: "#f1f5f9", // slate-100
  surfaceMutedActive: "#e2e8f0", // slate-200（secondary ボタン enabled）
  surfaceMutedActivePressed: "#cbd5e1", // slate-300（secondary ボタン pressed）
  emptyState: "#f1f5f9", // slate-100

  // === 2. メイン（Slate-800） ===
  main: "#1e293b", // slate-800
  mainHover: "#334155", // slate-700
  mainDark: "#0f172a", // slate-900

  // === 3. アクセント（濃い青） ===
  accent: "#1d4ed8", // blue-700
  accentMuted: "#2563eb", // blue-600

  // === 4. テキスト ===
  textPrimary: "#0f172a", // slate-900
  textSecondary: "#475569", // slate-600
  textMuted: "#64748b", // slate-500
  textOnDark: "#ffffff",

  // === 5. アイコン（hex必須: Lucide, ActivityIndicator） ===
  icon: "#64748b", // slate-500
  iconMuted: "#94a3b8", // slate-400
  iconPlaceholder: "#cbd5e1", // slate-300

  // === 6. ボーダー ===
  border: "#e2e8f0", // slate-200
  borderLight: "#f1f5f9", // slate-100

  // === 7. セマンティック ===
  success: "#10b981", // emerald-500
  error: "#ef4444", // red-500
  warning: "#f59e0b", // amber-500
  info: "#64748b", // slate-500（ブルーは使用しない）

  // === 8. ステータス（triage）落ち着いたトーン ===
  statusNew: "#0284c7", // sky-600
  statusReadSoon: "#059669", // emerald-600
  statusStock: "#d97706", // amber-600
  statusDone: "#64748b", // slate-500（ニュートラルな完了表現）
  statusDefault: "#cbd5e1", // slate-300

  // === 9. UIオーバーレイ・モーダル ===
  backdrop: "#000000",
  handleIndicator: "#d1d5db", // gray-300
  shadow: "#000000",

  // === 10. フォーム・ボタン変種 ===
  disabled: "#94a3b8", // slate-400
  danger: "#ef4444",
  dangerDisabled: "#fca5a5", // red-300

  // === 11. 外部連携 ===
  browserControls: "#94a3b8",
  browserToolbar: "#ffffff",
} as const;

export const colors = palette;

/** Tailwind className 用の色参照（className で使う場合は tailwind.config の extend を併用） */
export const colorClassNames = {
  main: "bg-slate-800",
  mainHover: "bg-slate-700",
  mainDark: "bg-slate-900",
  accent: "bg-blue-700",
  accentMuted: "bg-blue-600",
  surface: "bg-white",
  surfaceMuted: "bg-slate-100",
  surfaceMutedActive: "bg-slate-200",
  surfaceMutedActivePressed: "bg-slate-300",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-600",
  textMuted: "text-slate-500",
  textOnDark: "text-white",
  border: "border-slate-200",
  borderLight: "border-slate-100",
} as const;

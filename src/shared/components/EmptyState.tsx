import { Pressable, Text, View } from "react-native";

export interface EmptyStateProps {
  /** アイコンまたはイラスト（オプション） */
  icon?: React.ReactNode;
  /** 見出し（必須） */
  title: string;
  /** 補足説明 */
  description?: string;
  /** CTA ラベル */
  actionLabel?: string;
  /** CTA 押下時のコールバック */
  onAction?: () => void;
  /** CTA 内のアイコン（Plus, ArrowRight 等） */
  actionIcon?: React.ReactNode;
  /** CTA スタイル: primary=塗り、secondary=枠線のみ */
  ctaVariant?: "primary" | "secondary";
  /** コンテナの余白・配置 */
  variant?: "centered" | "compact";
}

/**
 * 汎用空状態コンポーネント
 *
 * Simple & Minimal デザイン: 余白を活かし、装飾を抑え、タイポグラフィで品格を出す。
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  ctaVariant = "primary",
  variant = "centered",
}: EmptyStateProps) {
  const hasAction = actionLabel && onAction;

  const containerClassName =
    variant === "centered"
      ? "flex-1 items-center justify-center px-10 py-12"
      : "items-center px-10 py-8";

  const contentClassName = "items-center gap-6";

  const ctaBaseClassName =
    ctaVariant === "primary"
      ? "rounded-full bg-mainDark px-6 py-2.5 active:bg-mainHover"
      : "rounded-full border border-slate-200 bg-white px-6 py-2.5 active:bg-slate-50";

  const ctaTextClassName =
    ctaVariant === "primary"
      ? "font-medium text-white"
      : "font-medium text-slate-700";

  return (
    <View className={containerClassName}>
      <View className={contentClassName}>
        {icon != null && (
          <View className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            {icon}
          </View>
        )}

        <View className="items-center gap-2">
          <Text className="text-center text-base font-medium tracking-tight text-slate-800">
            {title}
          </Text>
          {description != null && description !== "" && (
            <Text className="text-center text-sm leading-6 text-slate-500">
              {description}
            </Text>
          )}
        </View>

        {hasAction && (
          <Pressable
            onPress={onAction}
            className={`flex-row items-center justify-center gap-2 ${ctaBaseClassName}`}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            {actionIcon}
            <Text className={ctaTextClassName}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

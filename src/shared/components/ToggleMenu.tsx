import type { ReactNode } from "react";
import { useEffect } from "react";

import type { StyleProp, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BlurView } from "expo-blur";

import type { AnimatedStyle } from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface ToggleMenuItem {
  /** 安定キー */
  id: string;
  /** アイコンコンポーネント（lucide-react-nativeなど） */
  icon: ReactNode;
  /** メニュー項目のラベル */
  label: string;
  /** クリック時のアクション */
  onPress: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** テキストとアイコンの色（デフォルト: #64748B） */
  color?: string;
  /** ローディング表示フラグ */
  loading?: boolean;
  /** カスタムスタイルクラス */
  className?: string;
}

/** メニュー展開アニメーションの起点方向 */
export type ToggleMenuExpandOrigin = "top-right" | "bottom-right";

export interface ToggleMenuProps {
  /** メニュー項目の配列 */
  items: ToggleMenuItem[];
  /** メニューが開いているかどうか */
  isOpen: boolean;
  /** メニュー外をタップした時の処理 */
  onClose?: () => void;
  /** カスタムアニメーションスタイル（指定されない場合は内部で管理） */
  animationStyle?: AnimatedStyle;
  /** 位置指定（デフォルト: "bottom-20 right-0"） */
  position?: string;
  /** メニューの幅（デフォルト: 200） */
  width?: number;
  /** 展開アニメーションの起点方向（デフォルト: "bottom-right"） */
  expandOrigin?: ToggleMenuExpandOrigin;
  /** BlurViewのtint（デフォルト: "systemMaterial"） */
  blurTint?: "light" | "dark" | "default" | "systemMaterial";
  /** BlurViewのintensity（デフォルト: 50） */
  blurIntensity?: number;
}

/**
 * 汎用トグルメニューコンポーネント
 *
 * アイコン、アクション、アニメーションスタイル、位置指定を受け取れる汎用メニューコンポーネント。
 * このコンポーネントはメニュー本体のみを表示します。メニューを開くボタンは呼び出し元のコンポーネントで実装してください。
 */
const EXPAND_ORIGIN_TRANSLATE: Record<
  ToggleMenuExpandOrigin,
  { closedY: number; closedX: number }
> = {
  "top-right": { closedY: -20, closedX: 20 },
  "bottom-right": { closedY: 20, closedX: 20 },
};

export function ToggleMenu({
  items,
  isOpen,
  onClose,
  animationStyle: externalAnimationStyle,
  position = "bottom-20 right-0",
  width = 200,
  expandOrigin = "bottom-right",
  blurTint = "systemMaterial",
  blurIntensity = 50,
}: ToggleMenuProps) {
  const { closedY, closedX } = EXPAND_ORIGIN_TRANSLATE[expandOrigin];

  // アニメーション用のSharedValue（外部スタイルが指定されない場合のみ使用）
  const menuOpacity = useSharedValue(0);
  const menuScale = useSharedValue(0.8);
  const menuTranslateY = useSharedValue(closedY);
  const menuTranslateX = useSharedValue(closedX);

  // 内部アニメーションスタイル（外部スタイルが指定されない場合）
  const internalAnimationStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [
      { scale: menuScale.value },
      { translateY: menuTranslateY.value },
      { translateX: menuTranslateX.value },
    ],
  }));

  // 外部スタイルが指定されている場合はそれを使用、そうでなければ内部スタイルを使用
  const menuAnimatedStyle = externalAnimationStyle ?? internalAnimationStyle;

  // 内部アニメーションの更新（外部スタイルが指定されない場合のみ）
  useEffect(() => {
    if (!externalAnimationStyle) {
      if (isOpen) {
        menuOpacity.value = withTiming(1, { duration: 150 });
        menuScale.value = withTiming(1, { duration: 150 });
        menuTranslateY.value = withTiming(0, { duration: 150 });
        menuTranslateX.value = withTiming(0, { duration: 150 });
      } else {
        menuTranslateY.value = withTiming(closedY, { duration: 150 });
        menuTranslateX.value = withTiming(closedX, { duration: 150 });
        menuScale.value = withTiming(0.8, { duration: 150 });
        menuOpacity.value = withTiming(0, { duration: 150 });
      }
    }
  }, [
    isOpen,
    externalAnimationStyle,
    closedY,
    closedX,
    menuOpacity,
    menuScale,
    menuTranslateY,
    menuTranslateX,
  ]);

  return (
    <>
      {/* メニュー外をタップしたら閉じるオーバーレイ */}
      {isOpen && onClose && (
        <Pressable
          onPress={onClose}
          className="absolute inset-0 z-40 bg-transparent"
        />
      )}

      <Animated.View
        style={
          [menuAnimatedStyle, { width: width ?? 200 }] as StyleProp<ViewStyle>
        }
        className={`absolute z-50 ${position} overflow-hidden rounded-3xl`}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <BlurView
          tint={blurTint}
          intensity={blurIntensity}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100"
        >
          {items.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                onPress={item.onPress}
                disabled={!isOpen || item.disabled}
                className={`flex-row items-center gap-4 px-6 py-4 ${item.className ?? ""}`}
                activeOpacity={0.7}
              >
                {item.loading ? (
                  <ActivityIndicator
                    size="small"
                    color={item.color ?? "#64748B"}
                  />
                ) : (
                  item.icon
                )}
                <Text
                  className="text-base font-medium"
                  style={{ color: item.color ?? "#64748B" }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>

              {/* 区切り線（最後の項目以外） */}
              {index < items.length - 1 && (
                <View className="mx-2 h-px bg-slate-200/50" />
              )}
            </View>
          ))}
        </BlurView>
      </Animated.View>
    </>
  );
}

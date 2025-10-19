import { View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomSafeArea({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const marginBottom = insets.bottom + 50;
  return (
    <>
      <View
        className="absolute inset-x-0 top-0 z-10"
        style={{ height: insets.top }}
      >
        <LinearGradient
          // 透明から白へのグラデーション（白の透明を明示的に指定）
          colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0)"]}
          // 中央から下方向へのグラデーション
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ height: insets.top }}
        ></LinearGradient>
      </View>
      {children}
      <View
        className="absolute inset-x-0 bottom-0 z-10"
        style={{
          height: marginBottom,
        }}
      >
        <LinearGradient
          // 透明から白へのグラデーション（白の透明を明示的に指定）
          colors={["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]}
          // 中央から下方向へのグラデーション
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ height: marginBottom }}
        ></LinearGradient>
      </View>
    </>
  );
}

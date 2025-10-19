import { View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomSafeAreaProps {
  children: React.ReactNode;
  /**
   * Extra bottom padding in addition to the safe area inset.
   * Useful for providing additional spacing above bottom UI elements.
   * @default 50
   */
  bottomExtra?: number;
}

export default function CustomSafeArea({
  children,
  bottomExtra = 50,
}: CustomSafeAreaProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Main content with SafeArea padding */}
      <View className="flex-1">{children}</View>

      {/* Bottom decorative gradient overlay */}
      <View
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: insets.bottom + bottomExtra,
          zIndex: 10,
        }}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}

import { View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomSafeAreaProps {
  children: React.ReactNode;
}

export default function CustomSafeArea({ children }: CustomSafeAreaProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        className="absolute inset-x-0 top-0 z-10 bg-white/90"
        style={{ height: insets.top }}
      />
      {children}
      <View
        className="absolute inset-x-0 bottom-0 z-10"
        style={{ height: insets.bottom + 50 }}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]}
          style={{ height: insets.bottom + 50 }}
        />
      </View>
    </>
  );
}

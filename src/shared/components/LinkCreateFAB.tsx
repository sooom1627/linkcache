import { Pressable, StyleSheet } from "react-native";

import { SymbolView } from "expo-symbols";

import { useModal } from "@/src/shared/providers";

/**
 * リンク作成用Floating Action Button
 * 画面右下に固定配置され、タップでリンク作成モーダルを開く
 */
export function LinkCreateFAB() {
  const { openModal } = useModal();

  return (
    <Pressable
      onPress={() => openModal("linkCreate")}
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      accessibilityRole="button"
      accessibilityLabel="Add link"
    >
      <SymbolView name="plus" tintColor="#ffffff" size={24} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 50,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

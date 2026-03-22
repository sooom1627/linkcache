import { Modal, Pressable, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARD_STYLE = { borderCurve: "continuous" as const };

export type InformationDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  /** e.g. t("common.close") — taps outside the card dismiss the dialog */
  backdropAccessibilityLabel: string;
};

/**
 * OS の Alert ではなく、アプリ内で描画する情報用ダイアログ。
 */
export function InformationDialog(props: InformationDialogProps) {
  const {
    visible,
    onDismiss,
    title,
    message,
    confirmLabel,
    backdropAccessibilityLabel,
  } = props;

  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View
        className="flex-1 justify-center px-6"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backdropAccessibilityLabel}
          onPress={onDismiss}
          className="absolute inset-0 bg-black/50"
        />
        <View
          accessibilityRole="none"
          className="overflow-hidden rounded-2xl bg-white p-5 shadow-lg"
          style={CARD_STYLE}
        >
          <Text className="text-lg font-semibold text-slate-900">{title}</Text>
          <Text className="mt-3 text-sm leading-relaxed text-slate-600">
            {message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            onPress={onDismiss}
            className="mt-5 items-center rounded-xl bg-slate-800 py-3 active:bg-slate-700"
          >
            <Text className="text-base font-semibold text-white">
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

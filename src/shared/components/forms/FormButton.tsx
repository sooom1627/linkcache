import { Text, TouchableOpacity } from "react-native";

interface FormButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  disabledColor?: string;
  enabledColor?: string;
}

/**
 * Auth & User系フォーム専用の送信ボタン
 */
export default function FormButton({
  title,
  onPress,
  disabled = false,
  disabledColor = "bg-slate-400",
  enabledColor = "bg-slate-800",
}: FormButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-full items-center justify-center rounded-md p-4 ${
        disabled ? disabledColor : enabledColor
      }`}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
    </TouchableOpacity>
  );
}

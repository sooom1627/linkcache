import { Text, TouchableOpacity } from "react-native";

interface FormButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Auth & User系フォーム専用の送信ボタン
 */
export default function FormButton({
  title,
  onPress,
  disabled = false,
}: FormButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-full items-center justify-center rounded-md p-4 ${
        disabled ? "bg-zinc-400" : "bg-zinc-800"
      }`}
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
    </TouchableOpacity>
  );
}

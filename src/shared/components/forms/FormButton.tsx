import {
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface FormButtonProps
  extends Omit<TouchableOpacityProps, "className" | "style"> {
  title: string;
  disabledColor?: string;
  enabledColor?: string;
}

/**
 * Auth & User系フォーム専用の送信ボタン
 */
export default function FormButton({
  title,
  disabled = false,
  disabledColor = "bg-slate-400",
  enabledColor = "bg-main",
  ...rest
}: FormButtonProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      {...rest}
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

import { Text, TextInput, View, type TextInputProps } from "react-native";

interface FormInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  helperTextColor?: string;
  textContentType?: TextInputProps["textContentType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
}

/**
 * Auth & User系フォーム専用の入力コンポーネント
 * Zodバリデーションエラーやヘルパーテキスト（重複チェック結果など）の表示に対応
 */
export default function FormInput({
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  helperTextColor = "text-gray-500",
  textContentType,
  autoCapitalize = "none",
  secureTextEntry = false,
}: FormInputProps) {
  return (
    <View className="w-full">
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        textContentType={textContentType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        className={`w-full rounded-md bg-zinc-200 p-4 ${
          error ? "border border-red-500" : ""
        }`}
        accessibilityLabel={placeholder}
        accessibilityHint={helperText}
        accessibilityValue={{ text: value }}
      />
      {/* エラーメッセージ表示 */}
      {error && <Text className="mt-1 text-sm text-red-600">{error}</Text>}
      {/* ヘルパーテキスト表示（エラーがない場合のみ） */}
      {!error && helperText && (
        <Text className={`mt-1 text-sm ${helperTextColor}`}>{helperText}</Text>
      )}
    </View>
  );
}

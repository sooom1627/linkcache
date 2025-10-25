import { forwardRef, type ReactNode } from "react";

import { Text, TextInput, View, type TextInputProps } from "react-native";

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  helperTextColor?: string;
  textContentType?: TextInputProps["textContentType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCorrect?: TextInputProps["autoCorrect"];
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  blurOnSubmit?: boolean;
}

/**
 * Auth & User系フォーム専用の入力コンポーネント
 * Zodバリデーションエラーやヘルパーテキスト（重複チェック結果など）の表示に対応
 * アイコンを左右に配置可能
 * Label要素を常に表示することで、エラー表示時の画面ガタつきを防止
 */
const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      error,
      helperText,
      helperTextColor = "text-gray-500",
      textContentType,
      autoCapitalize = "none",
      secureTextEntry = false,
      keyboardType,
      autoCorrect,
      leftIcon,
      rightIcon,
      returnKeyType = "done",
      onSubmitEditing,
      blurOnSubmit = true,
    },
    ref,
  ) => {
    return (
      <View className="w-full">
        {/* Label行（常に表示、高さ固定） */}
        <View className="mb-2 h-6 flex-row items-center gap-2">
          {/* ラベルテキスト */}
          <Text className="text-sm font-medium text-gray-700">{label}</Text>
          {/* エラーメッセージ / ヘルパーテキスト表示領域（高さ固定） */}
          <View className="">
            {error ? (
              <Text className="text-sm text-red-600">{error}</Text>
            ) : helperText ? (
              <Text className={`text-sm ${helperTextColor}`}>{helperText}</Text>
            ) : null}
          </View>
        </View>

        {/* Input container with icons */}
        <View
          className={`flex-row items-center rounded-xl bg-slate-50 ${
            error ? "border border-red-500" : "border border-slate-200"
          }`}
        >
          {/* Left Icon */}
          {leftIcon && <View className="ml-4">{leftIcon}</View>}

          {/* Text Input */}
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            textContentType={textContentType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCorrect={autoCorrect}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
            className={`flex-1 p-4 ${leftIcon ? "pl-2" : ""} ${rightIcon ? "pr-2" : ""}`}
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityValue={secureTextEntry ? undefined : { text: value }}
          />

          {/* Right Icon */}
          {rightIcon && <View className="mr-4">{rightIcon}</View>}
        </View>
      </View>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;

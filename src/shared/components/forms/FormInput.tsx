import { forwardRef, type ReactNode } from "react";

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
 */
const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
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
        {/* Input container with icons */}
        <View
          className={`flex-row items-center rounded-md bg-slate-200 ${
            error ? "border border-red-500" : ""
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
            accessibilityLabel={placeholder}
            accessibilityHint={helperText}
            accessibilityValue={secureTextEntry ? undefined : { text: value }}
          />

          {/* Right Icon */}
          {rightIcon && <View className="mr-4">{rightIcon}</View>}
        </View>

        {/* エラーメッセージ表示 */}
        {error && <Text className="mt-1 text-sm text-red-600">{error}</Text>}

        {/* ヘルパーテキスト表示（エラーがない場合のみ） */}
        {!error && helperText && (
          <Text className={`mt-1 text-sm ${helperTextColor}`}>
            {helperText}
          </Text>
        )}
      </View>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;

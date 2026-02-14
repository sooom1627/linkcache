import { forwardRef, type ReactNode } from "react";

import {
  type TextInput as RNTextInput,
  type TextInputProps,
} from "react-native";

import { Text, TextInput, View } from "@/src/tw";

interface FormInputProps extends Omit<TextInputProps, "className" | "style"> {
  label: string;
  error?: string;
  helperText?: string;
  helperTextColor?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Auth & User系フォーム専用の入力コンポーネント
 * Zodバリデーションエラーやヘルパーテキスト（重複チェック結果など）の表示に対応
 * アイコンを左右に配置可能
 * Label要素を常に表示することで、エラー表示時の画面ガタつきを防止
 */
const FormInput = forwardRef<RNTextInput, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      helperTextColor = "text-gray-500",
      leftIcon,
      rightIcon,
      autoCapitalize = "none",
      returnKeyType = "done",
      blurOnSubmit = true,
      ...rest
    },
    ref,
  ) => {
    return (
      <View className="w-full">
        {/* Label行（常に表示、高さ固定） */}
        <View className="mb-2 h-6 flex-row items-center gap-2">
          {/* ラベルテキスト */}
          <Text className="text-sm font-medium text-slate-700">{label}</Text>
          {/* エラーメッセージ / ヘルパーテキスト表示領域（高さ固定） */}
          <View>
            {error ? (
              <Text className="text-sm text-red-600">{error}</Text>
            ) : helperText ? (
              <Text className={`text-sm ${helperTextColor}`}>{helperText}</Text>
            ) : null}
          </View>
        </View>

        {/* Input container with icons */}
        <View
          className={`flex-row items-center rounded-xl border bg-slate-50 ${
            error ? "border-red-500" : "border-slate-200"
          }`}
        >
          {/* Left Icon */}
          {leftIcon && <View className="ml-4">{leftIcon}</View>}

          {/* Text Input */}
          <TextInput
            // @ts-expect-error: CSS wrapper passes ref through to underlying RNTextInput
            ref={ref}
            autoCapitalize={autoCapitalize}
            returnKeyType={returnKeyType}
            blurOnSubmit={blurOnSubmit}
            {...rest}
            className={`flex-1 p-4 ${leftIcon ? "pl-2" : ""} ${rightIcon ? "pr-2" : ""}`}
            accessibilityLabel={label}
            accessibilityHint={helperText}
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

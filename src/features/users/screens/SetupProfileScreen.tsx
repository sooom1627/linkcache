import { useCallback, useRef } from "react";

import { Text, View, type TextInput } from "react-native";

import { AtSign, UserRound } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormButton, FormInput } from "@/src/shared/components/forms";

import LogoutButton from "../../auth/components/LogoutButton";
import {
  useCheckUserId,
  useCreateProfile,
  useProfileForm,
  type UseProfileFormReturn,
} from "../hooks";
import { getUserIdHelperText, isSubmitEnabled } from "../utils";

interface SetupProfileScreenProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * プロフィール設定画面のUIコンポーネント
 */
export function SetupProfileScreen({
  onSuccess,
  onError,
}: SetupProfileScreenProps) {
  // フォーム状態管理
  const {
    formData,
    errors,
    setUserId,
    setUsername,
    validateForm,
  }: UseProfileFormReturn = useProfileForm();

  // user_id重複チェック
  const {
    data: isUserIdAvailable,
    isLoading: isCheckingUserId,
    error: checkError,
  } = useCheckUserId(formData.user_id, true);

  // プロフィール作成
  const { mutate: createProfile, isPending } = useCreateProfile({
    onSuccess,
    onError,
  });

  // フォーム入力のref
  const usernameInputRef = useRef<TextInput>(null);

  // 送信処理
  const handleSubmit = useCallback(() => {
    // バリデーション
    if (!validateForm()) return;

    // user_id可用性チェック（undefined、false、またはチェック中の場合は送信不可）
    if (isUserIdAvailable !== true) return;

    // プロフィール作成
    createProfile(formData);
  }, [validateForm, isUserIdAvailable, createProfile, formData]);

  // user_idヘルパーテキスト
  const userIdHelper = getUserIdHelperText(
    formData.user_id,
    isCheckingUserId,
    checkError,
    isUserIdAvailable,
  );

  // 送信ボタン有効化判定
  const submitEnabled = isSubmitEnabled(
    isPending,
    isCheckingUserId,
    isUserIdAvailable,
    formData.user_id,
    formData.username,
    errors,
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-8 flex flex-1 flex-col justify-center gap-8">
        {/* Title */}
        <View className="w-full">
          <Text className="mb-2 text-3xl font-bold">Setup Your Profile</Text>
          <Text className="text-gray-600">
            Choose your unique user ID and display name
          </Text>
        </View>

        {/* User ID & Username Input */}
        <View className="w-full gap-4">
          <FormInput
            placeholder="User ID (4-32 characters)"
            value={formData.user_id}
            onChangeText={setUserId}
            keyboardType="default"
            autoCorrect={false}
            autoCapitalize="none"
            error={errors.user_id}
            helperText={userIdHelper?.text}
            helperTextColor={userIdHelper?.color}
            leftIcon={<AtSign size={16} color="#6B7280" />}
            returnKeyType="next"
            onSubmitEditing={() => usernameInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <FormInput
            ref={usernameInputRef}
            placeholder="Display Name (4-32 characters)"
            value={formData.username}
            onChangeText={setUsername}
            keyboardType="default"
            autoCorrect={false}
            autoCapitalize="none"
            error={errors.username}
            leftIcon={<UserRound size={16} color="#6B7280" />}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        {/* Submit Button */}
        <FormButton
          title={isPending ? "Creating..." : "Complete Setup"}
          onPress={handleSubmit}
          disabled={!submitEnabled}
        />

        {/* Logout Button */}
        <View className="w-full">
          <LogoutButton />
        </View>
      </View>
    </SafeAreaView>
  );
}

import { KeyboardAvoidingView, Text, View } from "react-native";

import { AtSign, UserRound } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormButton, FormInput } from "@/src/shared/components/forms";

import LogoutButton from "../../auth/components/LogoutButton";
import type { UseProfileSetupReturn } from "../hooks";
import { useProfileSetup } from "../hooks";
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
  const {
    userId,
    setUserId,
    username,
    setUsername,
    errors,
    isCheckingUserId,
    checkError,
    isUserIdAvailable,
    isPending,
    handleSubmit,
  }: UseProfileSetupReturn = useProfileSetup({ onSuccess, onError });

  // user_idヘルパーテキスト
  const userIdHelper = getUserIdHelperText(
    userId,
    isCheckingUserId,
    checkError,
    isUserIdAvailable,
  );

  // 送信ボタン有効化判定
  const submitEnabled = isSubmitEnabled(
    isPending,
    isCheckingUserId,
    isUserIdAvailable,
    userId,
    username,
    errors,
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
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
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
              error={errors.user_id}
              helperText={userIdHelper?.text}
              helperTextColor={userIdHelper?.color}
              leftIcon={<AtSign size={16} color="#6B7280" />}
            />
            <FormInput
              placeholder="Display Name (4-32 characters)"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              leftIcon={<UserRound size={16} color="#6B7280" />}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

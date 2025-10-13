import { useEffect, useState } from "react";

import { Alert, KeyboardAvoidingView, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ProfileSetupSchema,
  useCheckUserId,
  useCreateProfile,
  useProfile,
} from "@/src/features/users";
import type { ProfileSetupErrors } from "@/src/features/users/types/ProfileSetupSchema";
import { FormButton, FormInput } from "@/src/shared/components/forms";

export default function SetupProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<ProfileSetupErrors>({});

  // プロフィール設定済みチェック
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  // user_id重複チェック
  const {
    data: isUserIdAvailable,
    isLoading: isCheckingUserId,
    error: checkError,
  } = useCheckUserId(userId, true);

  // プロフィール作成
  const { mutate: createProfile, isPending } = useCreateProfile({
    onSuccess: () => {
      // プロフィールキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      Alert.alert("Success", "Profile created successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    },
    onError: (error) => {
      Alert.alert("Profile Setup Failed", error.message);
    },
  });

  // プロフィール設定済みの場合はメイン画面へリダイレクト
  useEffect(() => {
    if (!isProfileLoading && profile) {
      router.replace("/(tabs)");
    }
  }, [profile, isProfileLoading, router]);

  // リアルタイムZodバリデーション
  useEffect(() => {
    // 初期状態（両方空）ではエラーを表示しない
    if (userId.length === 0 && username.length === 0) {
      setErrors({});
      return;
    }

    const newErrors: ProfileSetupErrors = {};

    // user_idのバリデーション
    if (userId.length > 0) {
      const result = ProfileSetupSchema.shape.user_id.safeParse(userId);
      if (!result.success) {
        newErrors.user_id = result.error.issues[0]?.message;
      }
    }

    // usernameのバリデーション
    if (username.length > 0) {
      const result = ProfileSetupSchema.shape.username.safeParse(username);
      if (!result.success) {
        newErrors.username = result.error.issues[0]?.message;
      }
    }

    setErrors(newErrors);
  }, [userId, username]);

  // 送信処理
  const handleSubmit = () => {
    // 最終バリデーション
    const result = ProfileSetupSchema.safeParse({
      user_id: userId,
      username,
    });

    if (!result.success) {
      const newErrors: ProfileSetupErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileSetupErrors;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    // user_id可用性チェック（undefined、false、またはチェック中の場合は送信不可）
    if (isUserIdAvailable !== true) {
      if (isCheckingUserId) {
        Alert.alert("Please Wait", "Checking user ID availability...");
      } else {
        Alert.alert(
          "User ID Unavailable",
          "This user ID is already taken or unavailable. Please choose another one.",
        );
      }
      return;
    }

    // プロフィール作成
    createProfile({ user_id: userId, username });
  };

  // ヘルパーテキストの生成（user_id用）
  const getUserIdHelperText = () => {
    if (userId.length < 4) return undefined;

    if (isCheckingUserId) {
      return { text: "Checking availability...", color: "text-gray-500" };
    }

    if (checkError) {
      return { text: "Error checking availability", color: "text-red-600" };
    }

    if (isUserIdAvailable) {
      return { text: "✓ Available", color: "text-green-600" };
    }

    return { text: "✗ Already taken", color: "text-red-600" };
  };

  const userIdHelper = getUserIdHelperText();

  // 送信ボタンの有効/無効判定
  const isSubmitDisabled =
    isPending ||
    isCheckingUserId ||
    isUserIdAvailable !== true ||
    userId.length < 4 ||
    username.length < 4 ||
    !!errors.user_id ||
    !!errors.username;

  // ローディング中またはプロフィール設定済みの場合は何も表示しない
  if (isProfileLoading || profile) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="mx-8 flex flex-1 flex-col justify-center">
          {/* Title */}
          <View className="mb-8">
            <Text className="mb-2 text-3xl font-bold">Setup Your Profile</Text>
            <Text className="text-gray-600">
              Choose your unique user ID and display name
            </Text>
          </View>

          {/* User ID Input */}
          <View className="mb-4">
            <FormInput
              placeholder="User ID (4-32 characters)"
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
              error={errors.user_id}
              helperText={userIdHelper?.text}
              helperTextColor={userIdHelper?.color}
            />
          </View>

          {/* Username Input */}
          <View className="mb-8">
            <FormInput
              placeholder="Display Name (4-32 characters)"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
            />
          </View>

          {/* Submit Button */}
          <FormButton
            title={isPending ? "Creating..." : "Complete Setup"}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

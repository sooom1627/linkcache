import { useCallback, useEffect, useState } from "react";

import { Alert, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import AuthButton from "@/src/features/auth/components/AuthButton";
import AuthInput from "@/src/features/auth/components/AuthInput";
import {
  ProfileSetupSchema,
  useCheckUserId,
  useCreateProfile,
} from "@/src/features/users";

export default function SetupProfile() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [shouldCheckUserId, setShouldCheckUserId] = useState(false);
  const [errors, setErrors] = useState<{
    user_id?: string;
    username?: string;
  }>({});

  // user_id重複チェック
  const {
    data: isUserIdAvailable,
    isLoading: isCheckingUserId,
    error: checkError,
  } = useCheckUserId(userId, shouldCheckUserId);

  // プロフィール作成
  const { mutate: createProfile, isPending } = useCreateProfile({
    onSuccess: () => {
      Alert.alert("Success", "Profile created successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    },
    onError: (error) => {
      Alert.alert("Profile Setup Failed", error.message);
    },
  });

  // user_id入力時の重複チェック
  useEffect(() => {
    if (userId.length >= 4) {
      setShouldCheckUserId(true);
    } else {
      setShouldCheckUserId(false);
    }
  }, [userId]);

  // フォームのバリデーション
  const validateForm = useCallback((): boolean => {
    try {
      ProfileSetupSchema.parse({
        user_id: userId,
        username,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as {
          issues: Array<{ path: string[]; message: string }>;
        };
        const newErrors: { user_id?: string; username?: string } = {};

        zodError.issues.forEach((issue) => {
          const field = issue.path[0] as "user_id" | "username";
          newErrors[field] = issue.message;
        });

        setErrors(newErrors);
      }
      return false;
    }
  }, [userId, username]);

  // 送信処理
  const handleSubmit = () => {
    // バリデーション
    if (!validateForm()) {
      return;
    }

    // user_id重複チェック
    if (isUserIdAvailable === false) {
      Alert.alert(
        "User ID Taken",
        "This user ID is already taken. Please choose another one.",
      );
      return;
    }

    // 重複チェックがまだ完了していない場合
    if (isCheckingUserId) {
      Alert.alert("Please Wait", "Checking user ID availability...");
      return;
    }

    // プロフィール作成
    createProfile({ user_id: userId, username });
  };

  // 送信ボタンの有効/無効判定
  const isSubmitDisabled =
    isPending ||
    isCheckingUserId ||
    isUserIdAvailable === false ||
    userId.length < 4 ||
    username.length < 4;

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          <AuthInput
            placeholder="User ID (4-32 characters)"
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
          />
          {/* エラーメッセージ */}
          {errors.user_id && (
            <Text className="mt-1 text-sm text-red-600">{errors.user_id}</Text>
          )}
          {/* 重複チェック結果表示 */}
          {shouldCheckUserId && !errors.user_id && (
            <View className="mt-2">
              {isCheckingUserId ? (
                <Text className="text-sm text-gray-500">
                  Checking availability...
                </Text>
              ) : checkError ? (
                <Text className="text-sm text-red-600">
                  Error checking availability
                </Text>
              ) : isUserIdAvailable ? (
                <Text className="text-sm text-green-600">✓ Available</Text>
              ) : (
                <Text className="text-sm text-red-600">✗ Already taken</Text>
              )}
            </View>
          )}
        </View>

        {/* Username Input */}
        <View className="mb-8">
          <AuthInput
            placeholder="Display Name (4-32 characters)"
            value={username}
            onChangeText={setUsername}
          />
          {/* エラーメッセージ */}
          {errors.username && (
            <Text className="mt-1 text-sm text-red-600">{errors.username}</Text>
          )}
        </View>

        {/* Submit Button */}
        <AuthButton
          title={isPending ? "Creating..." : "Complete Setup"}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        />
      </View>
    </SafeAreaView>
  );
}

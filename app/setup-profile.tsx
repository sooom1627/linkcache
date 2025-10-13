import { useEffect, useState } from "react";

import { Alert, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  ProfileSetupSchema,
  useCheckUserId,
  useCreateProfile,
} from "@/src/features/users";
import { FormButton, FormInput } from "@/src/shared/components/forms";

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

  // user_id入力時の重複チェック制御
  useEffect(() => {
    if (userId.length >= 4 && /^[a-zA-Z0-9_]+$/.test(userId)) {
      setShouldCheckUserId(true);
    } else {
      setShouldCheckUserId(false);
    }
  }, [userId]);

  // リアルタイムZodバリデーション
  useEffect(() => {
    // 初期状態（両方空）ではエラーを表示しない
    if (userId.length === 0 && username.length === 0) {
      setErrors({});
      return;
    }

    const newErrors: { user_id?: string; username?: string } = {};

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
      const newErrors: { user_id?: string; username?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "user_id" | "username";
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
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

  // ヘルパーテキストの生成（user_id用）
  const getUserIdHelperText = () => {
    if (!shouldCheckUserId) return undefined;

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
    isUserIdAvailable === false ||
    userId.length < 4 ||
    username.length < 4 ||
    !!errors.user_id ||
    !!errors.username;

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
    </SafeAreaView>
  );
}

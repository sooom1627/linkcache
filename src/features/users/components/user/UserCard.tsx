import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

import { ChevronRight, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { Text, TouchableOpacity, View } from "@/src/tw";

import {
  useImagePicker,
  useProfile,
  useUploadAvatar,
  type PickedImage,
} from "../../hooks";

import { Avatar } from "./Avatar";

interface UserCardProps {
  avatarSize?: "small" | "medium" | "large" | "xlarge";
  onPressEditProfile?: () => void;
}

export default function UserCard({
  avatarSize = "medium",
  onPressEditProfile,
}: UserCardProps) {
  const { data: profile, isLoading, error } = useProfile();
  const {
    pickImageFromLibrary,
    pickImageFromCamera,
    requestLibraryPermission,
    requestCameraPermission,
  } = useImagePicker();
  const { mutate: uploadAvatar, isPending } = useUploadAvatar();
  const { t } = useTranslation();

  const handleImagePicked = async (
    picker: () => Promise<PickedImage | null>,
  ) => {
    const image = await picker();
    if (image) {
      uploadAvatar({
        fileUri: image.uri,
        mimeType: image.mimeType,
      });
    }
  };

  const handleCameraSelected = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      void handleImagePicked(pickImageFromCamera);
    } else {
      Alert.alert(
        t("users.user_card.permission_required"),
        t("users.user_card.please_allow_access_to_camera"),
      );
    }
  };

  const handleLibrarySelected = async () => {
    const hasPermission = await requestLibraryPermission();
    if (hasPermission) {
      void handleImagePicked(pickImageFromLibrary);
    } else {
      Alert.alert(
        t("users.user_card.permission_required"),
        t("users.user_card.please_allow_access_to_photo_library"),
      );
    }
  };

  const handleAvatarUpload = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("users.user_card.cancel"),
            t("users.user_card.take_photo"),
            t("users.user_card.choose_from_library"),
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            void handleCameraSelected();
          } else if (buttonIndex === 2) {
            void handleLibrarySelected();
          }
        },
      );
    } else {
      // Androidの場合はAlertを使用
      Alert.alert(
        t("users.user_card.upload_avatar"),
        t("users.user_card.choose_a_photo_source"),
        [
          {
            text: t("users.user_card.cancel"),
            style: "cancel",
          },
          {
            text: t("users.user_card.take_photo"),
            onPress: () => {
              void handleCameraSelected();
            },
          },
          {
            text: t("users.user_card.choose_from_library"),
            onPress: () => {
              void handleLibrarySelected();
            },
          },
        ],
        { cancelable: true },
      );
    }
  };

  if (isLoading || error) {
    return (
      <View className="flex flex-row items-center gap-4 rounded-3xl bg-slate-50 py-4 pl-4 pr-2">
        <Text className="text-base text-slate-700">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-row items-center gap-4 rounded-3xl bg-slate-50 py-4 pl-4 pr-2">
      <View className="relative flex-row items-center justify-center">
        <Avatar
          avatarUrl={profile?.avatar_url}
          updatedAt={profile?.updated_at}
          size={avatarSize}
          accessibilityLabel="No function"
        />
        <TouchableOpacity
          onPress={handleAvatarUpload}
          disabled={isPending}
          hitSlop={16}
          activeOpacity={0.8}
          className="absolute bottom-0 right-0 rounded-full bg-slate-700 p-1"
        >
          {isPending ? (
            <ActivityIndicator
              style={{ width: 12, height: 12 }}
              color="white"
            />
          ) : (
            <Plus size={12} color="white" />
          )}
        </TouchableOpacity>
      </View>
      <View className=" flex-1 flex-row items-center justify-between">
        <View className="flex-col items-start justify-start">
          <Text className="text-xl font-bold text-slate-700">
            {profile?.username}
          </Text>
          <Text className="text-base text-slate-500">@{profile?.user_id}</Text>
        </View>
        <TouchableOpacity
          onPress={onPressEditProfile}
          className="mt-2 flex-row items-center justify-center gap-2 px-2"
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          accessibilityHint="Edit profile"
          hitSlop={16}
        >
          <Text className="text-base text-slate-700">
            {t("users.user_card.edit_profile")}
          </Text>
          <ChevronRight size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

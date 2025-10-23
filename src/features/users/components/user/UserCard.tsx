import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ChevronRight, Plus } from "lucide-react-native";

import {
  useImagePicker,
  useProfile,
  useUploadAvatar,
  type PickedImage,
} from "../../hooks";

import Avatar from "./Avatar";

interface UserCardProps {
  avatarSize?: "small" | "medium" | "large" | "xlarge";
  onPressEditProfile?: () => void;
}

export default function UserCard({
  avatarSize = "medium",
  onPressEditProfile,
}: UserCardProps) {
  const { data: profile } = useProfile();
  const {
    pickImageFromLibrary,
    pickImageFromCamera,
    requestLibraryPermission,
    requestCameraPermission,
  } = useImagePicker();
  const { mutate: uploadAvatar, isPending } = useUploadAvatar();

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
      Alert.alert("Permission Required", "Please allow camera access.");
    }
  };

  const handleLibrarySelected = async () => {
    const hasPermission = await requestLibraryPermission();
    if (hasPermission) {
      void handleImagePicked(pickImageFromLibrary);
    } else {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
    }
  };

  const handleAvatarUpload = () => {
    if (Platform.OS === "ios") {
      // iOSの場合はActionSheetを使用
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
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
        "Upload Avatar",
        "Choose a photo source",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Take Photo",
            onPress: () => {
              void handleCameraSelected();
            },
          },
          {
            text: "Choose from Library",
            onPress: () => {
              void handleLibrarySelected();
            },
          },
        ],
        { cancelable: true },
      );
    }
  };

  return (
    <View className="flex flex-row items-center gap-4 border-b border-slate-200 py-4">
      <View className="relative flex-row items-center justify-center">
        <Avatar
          avatarUrl={profile?.avatar_url}
          updatedAt={profile?.updated_at}
          onPress={() => {}}
          size={avatarSize}
        />
        <TouchableOpacity
          onPress={handleAvatarUpload}
          disabled={isPending}
          hitSlop={16}
          activeOpacity={0.8}
          className="absolute bottom-0 right-0 rounded-full bg-slate-700 p-1"
        >
          {isPending ? (
            <ActivityIndicator size="small" color="white" />
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
        >
          <Text className="text-base text-slate-700">Edit Profile</Text>
          <ChevronRight size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

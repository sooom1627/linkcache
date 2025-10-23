import { Text, TouchableOpacity, View } from "react-native";

import { ChevronRight } from "lucide-react-native";

import { useProfile } from "../../hooks";

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
  const noop = () => {};
  return (
    <View className="flex flex-row items-center gap-4 border-b border-slate-200 py-4">
      <Avatar onPress={noop} size={avatarSize} />
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

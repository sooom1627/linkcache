import { Image, Pressable } from "react-native";

import { UserRound } from "lucide-react-native";

interface AvatarProps {
  onPress?: () => void;
  size?: "small" | "medium" | "large" | "xlarge";
}

export default function Avatar({
  onPress = () => {},
  size = "medium",
}: AvatarProps) {
  const avatarImage: string | null = "";
  const sizeClass = {
    small: "size-12",
    medium: "size-16",
    large: "size-24",
    xlarge: "size-32",
  };
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-center rounded-full bg-slate-200 p-4 ${sizeClass[size]}`}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      accessibilityHint="Open profile"
    >
      {avatarImage ? (
        <Image source={{ uri: avatarImage }} className="size-10 rounded-full" />
      ) : (
        <UserRound size={16} color="black" />
      )}
    </Pressable>
  );
}

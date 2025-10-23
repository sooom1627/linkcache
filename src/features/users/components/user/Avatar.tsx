import { Pressable, StyleSheet } from "react-native";

import { Image } from "expo-image";

import { UserRound } from "lucide-react-native";

import { useProfile } from "../../hooks";

interface AvatarProps {
  onPress?: () => void;
  size?: "small" | "medium" | "large" | "xlarge";
}

// シンプルなグレーのプレースホルダー画像（Base64 1x1 pixel）
const PLACEHOLDER_BLURHASH = "LKO2?U%2Tw=w]~RBVZRi};RPxuwH";

export default function Avatar({
  onPress = () => {},
  size = "medium",
}: AvatarProps) {
  const sizeMap = {
    small: 48,
    medium: 64,
    large: 96,
    xlarge: 128,
  };

  const iconSize = {
    small: 24,
    medium: 32,
    large: 48,
    xlarge: 64,
  };

  const avatarSize = sizeMap[size];
  const { data: profile } = useProfile();

  // デバッグ用ログ
  console.log("Avatar render:", {
    avatar_url: profile?.avatar_url,
    updated_at: profile?.updated_at,
  });

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
      ]}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      accessibilityHint="Open profile"
    >
      {profile?.avatar_url ? (
        <Image
          source={{
            uri: profile.updated_at
              ? `${profile.avatar_url}?v=${new Date(profile.updated_at).getTime()}`
              : profile.avatar_url,
          }}
          placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
      ) : (
        <UserRound size={iconSize[size]} color="black" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    borderWidth: 4,
    borderColor: "#E2E8F0",
  },
  image: {
    overflow: "hidden",
  },
});

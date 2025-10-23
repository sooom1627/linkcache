import { useMemo } from "react";

import { Pressable, StyleSheet, View } from "react-native";

import { Image } from "expo-image";

import { UserRound } from "lucide-react-native";

interface AvatarProps {
  avatarUrl?: string | null;
  updatedAt?: string | null;
  onPress?: () => void;
  size?: "small" | "medium" | "large" | "xlarge";
}

// シンプルなグレーのプレースホルダー画像
const PLACEHOLDER_BLURHASH = "LKO2?U%2Tw=w]~RBVZRi};RPxuwH";

export default function Avatar({
  avatarUrl,
  updatedAt,
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

  // URLにバージョンパラメータを追加（キャッシュバスティング）
  const imageUri = useMemo(() => {
    if (!avatarUrl) return null;
    return updatedAt
      ? `${avatarUrl}?v=${new Date(updatedAt).getTime()}`
      : avatarUrl;
  }, [avatarUrl, updatedAt]);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container]}
      className="rounded-full border-2 border-slate-200"
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      accessibilityHint="Open profile"
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
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
        <View
          className="items-center justify-center rounded-full bg-slate-200"
          style={{ width: avatarSize, height: avatarSize }}
        >
          <UserRound size={iconSize[size]} color="black" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },
  image: {
    overflow: "hidden",
  },
});

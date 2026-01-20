import { StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";

import type { UserLink } from "../types/linkList.types";

interface SwipeCardProps {
  link: UserLink;
  /** カードのインデックス（0: top, 1: next, 2: queued） */
  index?: number;
}

/**
 * スワイプ可能なカードコンポーネント
 *
 * OGP画像、タイトル、URLを表示します。
 * スタック表示用にindexプロパティを受け取ります。
 */
export function SwipeCard({ link }: SwipeCardProps) {
  const hasImage = !!link.image_url;

  return (
    <View style={styles.card}>
      {/* OGP Image */}
      {hasImage && link.image_url && (
        <Image
          source={{ uri: link.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {link.title || "No title"}
        </Text>
        <Text style={styles.url} numberOfLines={1}>
          {link.url}
        </Text>
        {link.site_name && (
          <Text style={styles.siteName} numberOfLines={1}>
            {link.site_name}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 220,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  url: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  siteName: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
});

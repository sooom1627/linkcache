import { useLocalSearchParams, useRouter } from "expo-router";

import { CollectionDetailScreen } from "@/src/features/links/screens/CollectionDetailScreen";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

/**
 * コレクション詳細ルート
 *
 * CollectionCard タップ時の遷移先。
 * ルーティングとレイアウトのみ担当。
 */
export default function CollectionDetailRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ScreenContainer
      scrollable={false}
      noPaddingBottom
      centerContent={false}
      topComponent={false}
      onBackPress={() => router.back()}
    >
      <CollectionDetailScreen rawId={params.id} />
    </ScreenContainer>
  );
}

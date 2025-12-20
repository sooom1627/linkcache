import { useMutation } from "@tanstack/react-query";

import { createLink } from "../api/createLink.api";
import { fetchLinkMetadata } from "../utils/metadata";

export function useCreateLink() {
  return useMutation({
    mutationFn: async (url: string) => {
      // 1. メタデータを取得
      const metadata = await fetchLinkMetadata(url);

      // 2. リンクを作成（API呼び出し）
      const result = await createLink(url, metadata);

      return result;
    },
  });
}

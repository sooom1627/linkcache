import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// テスト間で共有するQueryClientインスタンス
export const testQueryClient = createTestQueryClient();

// テスト間でキャッシュをクリアするユーティリティ関数
export const clearQueryCache = () => {
  testQueryClient.clear();
  testQueryClient.getQueryCache().clear();
  testQueryClient.getMutationCache().clear();
};

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
);

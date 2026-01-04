import React from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

// Wrap components with BottomSheetModalProvider for testing modal interactions
// GestureHandlerRootView is required for BottomSheetModal to work
export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryClientProvider client={testQueryClient}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </QueryClientProvider>
  </GestureHandlerRootView>
);

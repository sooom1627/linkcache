import React from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

// Wrap components with BottomSheetModalProvider for testing modal interactions
// GestureHandlerRootView is required for BottomSheetModal to work
export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryClientProvider client={createTestQueryClient()}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </QueryClientProvider>
  </GestureHandlerRootView>
);

// Custom render function that wraps components with necessary test providers
export const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper, ...options });

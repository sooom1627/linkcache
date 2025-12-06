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
        gcTime: Infinity,
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

// Create a custom render function to appease Jest "test suite must contain at least one test"
// and to allow importing this file as a test utility.
export const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper, ...options });

// Dummy test to satisfy Jest
describe("test-utils", () => {
  it("dummy", () => {
    expect(true).toBe(true);
  });
});

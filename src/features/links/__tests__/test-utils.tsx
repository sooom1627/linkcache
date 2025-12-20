import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
        gcTime: 0,
      },
    },
  });

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider>
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  </SafeAreaProvider>
);

export const customRenderHook = <TResult, TProps>(
  render: (initialProps: TProps) => TResult,
  options = {},
) => renderHook(render, { wrapper, ...options });

export const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper, ...options });

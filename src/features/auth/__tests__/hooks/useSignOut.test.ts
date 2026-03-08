import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import {
  collectionQueryKeys,
  linkQueryKeys,
} from "@/src/features/links/constants/queryKeys";
import { userQueryKeys } from "@/src/features/users/constants/queryKeys";

import { signOut } from "../../api";
import { authQueryKeys } from "../../constants/queryKeys";
import { useSignOut } from "../../hooks/useSignOut";

jest.mock("../../api", () => ({
  signOut: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };

describe("useSignOut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("サインアウト成功時にauth, users, links, collectionsキャッシュを削除する", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const removeQueriesSpy = jest.spyOn(queryClient, "removeQueries");
    (signOut as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: authQueryKeys.all,
    });
    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: userQueryKeys.all,
    });
    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.all,
    });
    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.all,
    });
  });
});

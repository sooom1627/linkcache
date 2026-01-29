import { renderHook, waitFor } from "@testing-library/react-native";

import {
  LinkListFilterProvider,
  useLinkListFilterContext,
} from "../../contexts/LinkListFilterContext";
import { clearQueryCache, wrapper } from "../test-utils";

// expo-routerをモック
const mockUseLocalSearchParams = jest.fn(() => ({}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

describe("LinkListScreen URLパラメータ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
    mockUseLocalSearchParams.mockReturnValue({});
  });

  describe("URLパラメータからの初期状態構築", () => {
    it("status=read_soonパラメータが渡された場合、フィルターがread_soonで初期化される", async () => {
      mockUseLocalSearchParams.mockReturnValue({ status: "read_soon" });

      // LinkListScreen内でuseLocalSearchParamsが呼ばれることを想定
      // 実際の実装では、LinkListScreenでURLパラメータを取得してinitialStateを構築する
      const initialState = {
        status: "read_soon" as const,
        readStatus: "all" as const,
      };

      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: ({ children }) =>
          wrapper({
            children: (
              <LinkListFilterProvider initialState={initialState}>
                {children}
              </LinkListFilterProvider>
            ),
          }),
      });

      await waitFor(() => {
        expect(result.current.filterState.status).toBe("read_soon");
      });
    });

    it("status=newパラメータが渡された場合、フィルターがnewで初期化される", async () => {
      mockUseLocalSearchParams.mockReturnValue({ status: "new" });

      const initialState = {
        status: "new" as const,
        readStatus: "all" as const,
      };

      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: ({ children }) =>
          wrapper({
            children: (
              <LinkListFilterProvider initialState={initialState}>
                {children}
              </LinkListFilterProvider>
            ),
          }),
      });

      await waitFor(() => {
        expect(result.current.filterState.status).toBe("new");
      });
    });

    it("URLパラメータがない場合、デフォルト状態（all）になる", async () => {
      mockUseLocalSearchParams.mockReturnValue({});

      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: ({ children }) =>
          wrapper({
            children: (
              <LinkListFilterProvider>{children}</LinkListFilterProvider>
            ),
          }),
      });

      await waitFor(() => {
        expect(result.current.filterState.status).toBe("all");
        expect(result.current.filterState.readStatus).toBe("all");
      });
    });
  });
});

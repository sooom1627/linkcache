import { renderHook, waitFor } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useSharedLinkSync } from "../../hooks/useSharedLinkSync";

// React Native の AppState をモック
jest.mock("react-native", () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
  Platform: {
    OS: "ios",
  },
}));

// Auth フックをモック
jest.mock("@/src/features/auth", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/src/features/auth";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("useSharedLinkSync", () => {
  let queryClient: QueryClient;
  let mockAddEventListener: jest.Mock;
  let mockRemove: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockRemove = jest.fn();
    mockAddEventListener = jest.fn(() => ({
      remove: mockRemove,
    }));

    (AppState.addEventListener as jest.Mock) = mockAddEventListener;

    // queryClient.invalidateQueries をスパイ
    jest.spyOn(queryClient, "invalidateQueries");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  interface WrapperProps {
    children: React.ReactNode;
  }

  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("認証済みの場合、AppState が active になったときにリンク一覧を無効化する", async () => {
    // 認証済みユーザーをモック
    mockUseAuth.mockReturnValue({
      user: { id: "user-123" },
      session: { access_token: "token" },
    } as any);

    renderHook(() => useSharedLinkSync(), { wrapper });

    // AppState リスナーが登録されていることを確認
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    // リスナー関数を取得
    const listener = mockAddEventListener.mock.calls[0][1];

    // AppState を 'active' に変更
    listener("active" as AppStateStatus);

    await waitFor(() => {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["links"],
      });
    });
  });

  it("認証なしの場合、AppState が active になっても何もしない", async () => {
    // 未認証ユーザーをモック
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
    } as any);

    renderHook(() => useSharedLinkSync(), { wrapper });

    // AppState リスナーが登録されていることを確認
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    // リスナー関数を取得
    const listener = mockAddEventListener.mock.calls[0][1];

    // AppState を 'active' に変更
    listener("active" as AppStateStatus);

    await waitFor(() => {
      // invalidateQueries が呼ばれていないことを確認
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  it("AppState が background になった場合は何もしない", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123" },
      session: { access_token: "token" },
    } as any);

    renderHook(() => useSharedLinkSync(), { wrapper });

    const listener = mockAddEventListener.mock.calls[0][1];

    // AppState を 'background' に変更
    listener("background" as AppStateStatus);

    await waitFor(() => {
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  it("アンマウント時にリスナーをクリーンアップする", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123" },
      session: { access_token: "token" },
    } as any);

    const { unmount } = renderHook(() => useSharedLinkSync(), { wrapper });

    expect(mockRemove).not.toHaveBeenCalled();

    unmount();

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});

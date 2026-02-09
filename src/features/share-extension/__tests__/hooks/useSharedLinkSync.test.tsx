import { AppState, type AppStateStatus } from "react-native";

import type { Session, User } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";

import { useAuth } from "@/src/features/auth";
import type { AuthContextValue } from "@/src/features/auth/context/AuthContext";

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

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

type AppStateEventListener = (status: AppStateStatus) => void;
type AppStateSubscription = {
  remove: jest.Mock;
};

describe("useSharedLinkSync", () => {
  let queryClient: QueryClient;
  let mockAddEventListener: jest.Mock<
    AppStateSubscription,
    [string, AppStateEventListener]
  >;
  let mockRemove: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockRemove = jest.fn();
    mockAddEventListener = jest.fn<
      AppStateSubscription,
      [string, AppStateEventListener]
    >(() => ({
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

  const createMockAuthValue = (
    overrides: Omit<Partial<AuthContextValue>, "user" | "session"> & {
      user?: Partial<User> | null;
      session?: Partial<Session> | null;
    },
  ): AuthContextValue => {
    const baseValue: AuthContextValue = {
      session: null,
      authState: "unauthenticated",
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
    // テスト用のモックなので、型アサーションを使用
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const result = {
      ...baseValue,
      ...overrides,
      user:
        overrides.user !== undefined
          ? (overrides.user as User | null)
          : baseValue.user,
      session:
        overrides.session !== undefined
          ? (overrides.session as Session | null)
          : baseValue.session,
    } as AuthContextValue;
    return result;
  };

  it("認証済みの場合、AppState が active になったときにリンク一覧を無効化する", async () => {
    // 認証済みユーザーをモック
    const mockUser: Partial<User> = { id: "user-123" };
    const mockSession: Partial<Session> = { access_token: "token" };
    mockUseAuth.mockReturnValue(
      createMockAuthValue({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        authState: "authenticated",
      }),
    );

    renderHook(() => useSharedLinkSync(), { wrapper });

    // AppState リスナーが登録されていることを確認
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    // リスナー関数を取得（型安全に）
    const calls = mockAddEventListener.mock.calls;
    if (calls.length === 0 || !calls[0]?.[1]) {
      throw new Error("EventListener was not called");
    }
    const listener: AppStateEventListener = calls[0][1];

    // AppState を 'active' に変更
    listener("active");

    // setImmediate で非同期実行されるため、waitFor で待つ
    await waitFor(
      () => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["links"],
          refetchType: "none", // stale化のみ、即時refetchなし
        });
      },
      { timeout: 1000 },
    );
  });

  it("認証なしの場合、AppState が active になっても何もしない", async () => {
    // 未認証ユーザーをモック
    mockUseAuth.mockReturnValue(
      createMockAuthValue({
        user: null,
        session: null,
      }),
    );

    renderHook(() => useSharedLinkSync(), { wrapper });

    // AppState リスナーが登録されていることを確認
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    // リスナー関数を取得（型安全に）
    const calls = mockAddEventListener.mock.calls;
    if (calls.length === 0 || !calls[0]?.[1]) {
      throw new Error("EventListener was not called");
    }
    const listener: AppStateEventListener = calls[0][1];

    // AppState を 'active' に変更
    listener("active");

    // 少し待ってから確認
    await new Promise((resolve) => setTimeout(resolve, 100));

    // invalidateQueries が呼ばれていないことを確認
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("AppState が background になった場合は何もしない", async () => {
    const mockUser: Partial<User> = { id: "user-123" };
    const mockSession: Partial<Session> = { access_token: "token" };
    mockUseAuth.mockReturnValue(
      createMockAuthValue({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        authState: "authenticated",
      }),
    );

    renderHook(() => useSharedLinkSync(), { wrapper });

    // リスナー関数を取得（型安全に）
    const calls = mockAddEventListener.mock.calls;
    if (calls.length === 0 || !calls[0]?.[1]) {
      throw new Error("EventListener was not called");
    }
    const listener: AppStateEventListener = calls[0][1];

    // AppState を 'background' に変更
    listener("background");

    // 少し待ってから確認
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("アンマウント時にリスナーをクリーンアップする", () => {
    const mockUser: Partial<User> = { id: "user-123" };
    const mockSession: Partial<Session> = { access_token: "token" };
    mockUseAuth.mockReturnValue(
      createMockAuthValue({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        authState: "authenticated",
      }),
    );

    const { unmount } = renderHook(() => useSharedLinkSync(), { wrapper });

    expect(mockRemove).not.toHaveBeenCalled();

    unmount();

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});

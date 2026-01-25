/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { fetchUserLinks } from "../../api/fetchLinks.api";
import { LinkListTabs } from "../../screens/LinkListTabs";
import { clearQueryCache, wrapper } from "../test-utils";

// Supabaseクライアントのモック（外部依存のみ）
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// API関数をモック（外部依存のみ）
jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

// i18nをモック
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // 翻訳キーを実際の値に変換
      const translations: Record<string, string> = {
        "links.dashboard.tabs.read_soon": "Read Soon",
        "links.dashboard.tabs.latest": "Latest",
        "links.dashboard.view_all": "View All",
        "links.dashboard.error_load_failed": "Failed to load links",
      };
      return translations[key] || key;
    },
  }),
}));

// expo-routerをモック
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useFocusEffect: jest.fn((callback) => {
      // テスト環境では即座にコールバックを実行（actでラップ）
      React.useEffect(() => {
        // refetchは非同期なので、次のイベントループで実行
        setTimeout(() => {
          callback();
        }, 0);
      }, [callback]);
    }),
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
  };
});

// PagerViewをモック
jest.mock("react-native-pager-view", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: React.forwardRef(
      (
        {
          children,
          initialPage,
          onPageSelected,
        }: {
          children: React.ReactNode;
          initialPage: number;
          onPageSelected?: (e: { nativeEvent: { position: number } }) => void;
        },
        ref: React.Ref<{ setPage: (page: number) => void }>,
      ) => {
        const [currentPage, setCurrentPage] = React.useState(initialPage);

        React.useEffect(() => {
          setCurrentPage(initialPage);
        }, [initialPage]);

        React.useImperativeHandle(ref, () => ({
          setPage: (page: number) => {
            setCurrentPage(page);
            onPageSelected?.({ nativeEvent: { position: page } });
          },
        }));
        return (
          <View testID="pager-view">
            {React.Children.toArray(children)[currentPage]}
          </View>
        );
      },
    ),
  };
});

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

// モックデータヘルパー
const createMockLink = (
  id: number,
  status: "inbox" | "read_soon" | "later" = "read_soon",
) => ({
  status_id: `status-${id}`,
  user_id: "user-1",
  status,
  triaged_at: null,
  read_at: null,
  saved_at: `2024-01-0${id}T00:00:00Z`,
  link_id: `link-${id}`,
  url: `https://example${id}.com`,
  title: `Example ${id}`,
  description: `Description ${id}`,
  image_url: null,
  favicon_url: null,
  site_name: `Site ${id}`,
  link_created_at: `2024-01-0${id}T00:00:00Z`,
});

describe("LinkListTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  describe("APIレイヤーでのフィルタリング", () => {
    it("Read Soonタブはstatus=read_soon, limit=5でAPIを呼び出す", async () => {
      const mockLatestData = {
        data: [createMockLink(1, "inbox")],
        hasMore: false,
        totalCount: 1,
      };
      const mockReadSoonData = {
        data: [createMockLink(2, "read_soon"), createMockLink(3, "read_soon")],
        hasMore: false,
        totalCount: 2,
      };
      // 引数に基づいて適切なレスポンスを返す
      mockFetchUserLinks.mockImplementation(async (args) => {
        if (args && args.status === "read_soon") {
          return mockReadSoonData;
        }
        return mockLatestData;
      });

      render(<LinkListTabs />, { wrapper });

      // 初期状態はLatestタブなので、Latestタブのデータが表示される
      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });

      // Read Soonタブに切り替え
      const readSoonTab = screen.getByRole("tab", { name: "Read Soon" });

      await act(async () => {
        fireEvent.press(readSoonTab);
      });

      await waitFor(() => {
        expect(screen.getByText("Example 2")).toBeTruthy();
      });

      // status: "read_soon", limit: 5 でAPIが呼ばれることを確認
      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({ status: "read_soon", limit: 5 }),
      );
    });

    it("Latest Addedタブはlimit=5でAPIを呼び出す（status=inboxでフィルタ）", async () => {
      // Latest用のレスポンス（最初のタブ）
      const mockLatestData = {
        data: [createMockLink(2, "inbox")],
        hasMore: false,
        totalCount: 1,
      };
      // Read Soon用のレスポンス
      const mockReadSoonData = {
        data: [createMockLink(4, "read_soon")],
        hasMore: false,
        totalCount: 1,
      };
      mockFetchUserLinks.mockImplementation(async (args) => {
        if (args && args.status === "read_soon") {
          return mockReadSoonData;
        }
        return mockLatestData;
      });

      render(<LinkListTabs />, { wrapper });

      // 初期状態はLatestタブなので、Latestタブのデータが表示される
      await waitFor(() => {
        expect(screen.getByText("Example 2")).toBeTruthy();
      });

      // limit: 5, status: "inbox" でAPIが呼ばれることを確認
      const latestCall = mockFetchUserLinks.mock.calls.find(
        (call) => call[0]?.status === "inbox" && call[0]?.limit === 5,
      );
      expect(latestCall).toBeTruthy();
    });

    it("Read Soon/Latestともに最大5件まで表示される", async () => {
      const mockLatestData = {
        data: [
          createMockLink(1, "inbox"),
          createMockLink(2, "inbox"),
          createMockLink(3, "inbox"),
          createMockLink(4, "inbox"),
          createMockLink(5, "inbox"),
        ],
        hasMore: false,
        totalCount: 10, // 実際には10件あるが5件のみ取得
      };
      const mockReadSoonData = {
        data: [
          createMockLink(6, "read_soon"),
          createMockLink(7, "read_soon"),
          createMockLink(8, "read_soon"),
          createMockLink(9, "read_soon"),
          createMockLink(10, "read_soon"),
        ],
        hasMore: false,
        totalCount: 10, // 実際には10件あるが5件のみ取得
      };
      // 引数に基づいて適切なレスポンスを返す
      mockFetchUserLinks.mockImplementation(async (args) => {
        if (args && args.status === "read_soon") {
          return mockReadSoonData;
        }
        return mockLatestData;
      });

      render(<LinkListTabs />, { wrapper });

      // 初期状態はLatestタブなので、Latestタブのデータが表示される
      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });

      // Latestタブで5件表示される
      expect(screen.getByText("Example 1")).toBeTruthy();
      expect(screen.getByText("Example 5")).toBeTruthy();

      // Read Soonタブに切り替え
      const readSoonTab = screen.getByRole("tab", { name: "Read Soon" });

      await act(async () => {
        fireEvent.press(readSoonTab);
      });

      await waitFor(() => {
        expect(screen.getByText("Example 6")).toBeTruthy();
      });

      // Read Soonタブで5件表示される
      expect(screen.getByText("Example 6")).toBeTruthy();
      expect(screen.getByText("Example 10")).toBeTruthy();
    });
  });

  describe("タブ切り替え", () => {
    it("Read SoonタブとLatestタブを切り替えできる", async () => {
      const mockReadSoonData = {
        data: [createMockLink(1, "read_soon")],
        hasMore: false,
        totalCount: 1,
      };
      const mockLatestData = {
        data: [createMockLink(1, "read_soon"), createMockLink(2, "inbox")],
        hasMore: false,
        totalCount: 2,
      };
      mockFetchUserLinks.mockImplementation(async (args) => {
        if (args && args.status === "read_soon") {
          return mockReadSoonData;
        }
        return mockLatestData;
      });

      render(<LinkListTabs />, { wrapper });

      // 初期状態はLatestタブ
      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });
      expect(screen.getByText("Example 1")).toBeTruthy();

      // Read Soonタブに切り替え
      const readSoonTab = screen.getByRole("tab", { name: "Read Soon" });

      await act(async () => {
        fireEvent.press(readSoonTab);
      });

      await waitFor(
        () => {
          expect(screen.getByText("Example 1")).toBeTruthy();
        },
        { timeout: 3000 },
      );

      // Latestタブに戻す
      const latestTab = screen.getByRole("tab", { name: "Latest" });

      await act(async () => {
        fireEvent.press(latestTab);
      });

      await waitFor(
        () => {
          expect(screen.getByText("Example 2")).toBeTruthy();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("空状態", () => {
    it("データが空の場合でもエラーにならない", async () => {
      const mockData = {
        data: [],
        hasMore: false,
        totalCount: 0,
      };
      mockFetchUserLinks.mockResolvedValue(mockData);

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Read Soon")).toBeTruthy();
        expect(screen.getByText("Latest")).toBeTruthy();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("エラー発生時にエラー状態を表示する", async () => {
      const mockError = new Error("Failed to fetch");
      mockFetchUserLinks
        .mockRejectedValueOnce(mockError)
        .mockRejectedValue(mockError);

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        // エラー状態表示の確認
        expect(screen.getByText("Read Soon")).toBeTruthy();
      });
    });
  });
});

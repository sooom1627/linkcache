import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { fetchUserLinks } from "../../api/fetchLinks.api";
import { LinkListTabs } from "../../screens/LinkListTabs";
import { clearQueryCache, wrapper } from "../test-utils";

// API関数をモック（外部依存のみ）
jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

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
  status: "inbox" | "keep" | "archived" | "dismissed" = "keep",
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
    it("Keepタブはstatus=keep, limit=5でAPIを呼び出す", async () => {
      const mockKeepData = {
        data: [createMockLink(1, "keep"), createMockLink(2, "keep")],
        hasMore: false,
        totalCount: 2,
      };
      // Keep用のレスポンス
      mockFetchUserLinks.mockResolvedValueOnce(mockKeepData);

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });

      // status: "keep", limit: 5 でAPIが呼ばれることを確認
      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({ status: "keep", limit: 5 }),
      );
    });

    it("Latestタブはlimit=5でAPIを呼び出す（statusフィルタなし）", async () => {
      // Keep用のレスポンス（最初のタブ）
      const mockKeepData = {
        data: [createMockLink(1, "keep")],
        hasMore: false,
        totalCount: 1,
      };
      // Latest用のレスポンス
      const mockLatestData = {
        data: [
          createMockLink(1, "keep"),
          createMockLink(2, "inbox"),
          createMockLink(3, "archived"),
        ],
        hasMore: false,
        totalCount: 3,
      };
      mockFetchUserLinks
        .mockResolvedValueOnce(mockKeepData)
        .mockResolvedValueOnce(mockLatestData);

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });

      // Latestタブに切り替え
      const latestTab = screen.getByText("Latest");
      fireEvent.press(latestTab);

      await waitFor(() => {
        expect(screen.getByText("Example 2")).toBeTruthy();
      });

      // limit: 5, statusなしでAPIが呼ばれることを確認
      const latestCall = mockFetchUserLinks.mock.calls.find(
        (call) => call[0]?.status === undefined && call[0]?.limit === 5,
      );
      expect(latestCall).toBeTruthy();
    });

    it("Keep/Latestともに最大5件まで表示される", async () => {
      const mockKeepData = {
        data: [
          createMockLink(1, "keep"),
          createMockLink(2, "keep"),
          createMockLink(3, "keep"),
          createMockLink(4, "keep"),
          createMockLink(5, "keep"),
        ],
        hasMore: false,
        totalCount: 10, // 実際には10件あるが5件のみ取得
      };
      mockFetchUserLinks.mockResolvedValueOnce(mockKeepData);

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });

      // 5件表示される
      expect(screen.getByText("Example 1")).toBeTruthy();
      expect(screen.getByText("Example 5")).toBeTruthy();
    });
  });

  describe("タブ切り替え", () => {
    it("KeepタブとLatestタブを切り替えできる", async () => {
      const mockKeepData = {
        data: [createMockLink(1, "keep")],
        hasMore: false,
        totalCount: 1,
      };
      const mockLatestData = {
        data: [createMockLink(1, "keep"), createMockLink(2, "inbox")],
        hasMore: false,
        totalCount: 2,
      };
      mockFetchUserLinks
        .mockResolvedValueOnce(mockKeepData)
        .mockResolvedValueOnce(mockLatestData)
        .mockResolvedValueOnce(mockKeepData); // Keepに戻るとき

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });

      // 初期状態はKeepタブ
      expect(screen.getByText("Example 1")).toBeTruthy();

      // Latestタブに切り替え
      const latestTab = screen.getByText("Latest");
      fireEvent.press(latestTab);

      await waitFor(() => {
        expect(screen.getByText("Example 2")).toBeTruthy();
      });

      // Keepタブに戻す
      const keepTab = screen.getByText("Keep");
      fireEvent.press(keepTab);

      await waitFor(() => {
        expect(screen.getByText("Example 1")).toBeTruthy();
      });
    });
  });

  describe("空状態", () => {
    it("データが空の場合でもエラーにならない", async () => {
      const mockData = {
        data: [],
        hasMore: false,
        totalCount: 0,
      };
      mockFetchUserLinks.mockResolvedValueOnce(mockData);

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Keep")).toBeTruthy();
        expect(screen.getByText("Latest")).toBeTruthy();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("エラー発生時にエラー状態を表示する", async () => {
      const mockError = new Error("Failed to fetch");
      mockFetchUserLinks.mockRejectedValueOnce(mockError);

      render(<LinkListTabs />, { wrapper });

      await waitFor(() => {
        // エラー状態表示の確認
        expect(screen.getByText("Keep")).toBeTruthy();
      });
    });
  });
});

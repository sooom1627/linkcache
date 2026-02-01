import type { ReactNode } from "react";
import React from "react";

import { AppState, type AppStateStatus } from "react-native";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createLinkWithStatus } from "@/src/features/links/api/createLink.api";
import { fetchOgpMetadata } from "@/src/features/links/utils/metadata";

import { usePendingSharedLinks } from "../../hooks/usePendingSharedLinks";
import type { SharedItem } from "../../types/sharedItem.types";
import * as appGroupReader from "../../utils/appGroupReader";

// モック設定
jest.mock("../../utils/appGroupReader");
jest.mock("@/src/features/links/api/createLink.api", () => ({
  createLinkWithStatus: jest.fn(),
}));
jest.mock("@/src/features/links/utils/metadata", () => ({
  fetchOgpMetadata: jest.fn(),
}));
jest.mock("@/src/features/links/utils/normalizeUrl", () => ({
  normalizeUrl: jest.fn((url: string) => url),
}));
jest.mock("@/src/features/auth", () => ({
  useAuth: () => ({ session: { user: { id: "test-user" } } }),
}));

// AppState のモック
const mockAppStateListeners: ((state: AppStateStatus) => void)[] = [];
jest.spyOn(AppState, "addEventListener").mockImplementation((_, handler) => {
  mockAppStateListeners.push(handler);
  return { remove: () => {} };
});

const mockAppGroupReader = appGroupReader as jest.Mocked<typeof appGroupReader>;

const mockCreateLinkWithStatus = createLinkWithStatus as jest.MockedFunction<
  typeof createLinkWithStatus
>;
const mockFetchOgpMetadata = fetchOgpMetadata as jest.MockedFunction<
  typeof fetchOgpMetadata
>;

describe("usePendingSharedLinks", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const sharedItem: SharedItem = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    url: "https://example.com/article",
    createdAt: "2024-01-15T10:30:00.000Z",
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
    mockAppStateListeners.length = 0;
  });

  it("マウント時に共有アイテムを処理する", async () => {
    mockAppGroupReader.readPendingSharedItems.mockResolvedValue([sharedItem]);
    mockFetchOgpMetadata.mockResolvedValue({
      title: "Example Article",
      description: "Article description",
      image_url: "https://example.com/image.jpg",
      site_name: "Example",
      favicon_url: "https://example.com/favicon.ico",
    });
    mockCreateLinkWithStatus.mockResolvedValue({
      link_id: "link-1",
      url: sharedItem.url,
      status: "new",
    });
    mockAppGroupReader.deleteProcessedItem.mockResolvedValue(undefined);

    renderHook(() => usePendingSharedLinks(), { wrapper });

    await waitFor(() => {
      expect(mockAppGroupReader.readPendingSharedItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockFetchOgpMetadata).toHaveBeenCalledWith(sharedItem.url);
    });

    await waitFor(() => {
      expect(mockCreateLinkWithStatus).toHaveBeenCalledWith({
        url: sharedItem.url,
        title: "Example Article",
        description: "Article description",
        image_url: "https://example.com/image.jpg",
        favicon_url: "https://example.com/favicon.ico",
        site_name: "Example",
      });
    });

    await waitFor(() => {
      expect(mockAppGroupReader.deleteProcessedItem).toHaveBeenCalledWith(
        sharedItem.id,
      );
    });
  });

  it("複数の共有アイテムを順番に処理する", async () => {
    const item2: SharedItem = {
      id: "660e8400-e29b-41d4-a716-446655440001",
      url: "https://example.com/article2",
      createdAt: "2024-01-15T11:00:00.000Z",
    };

    mockAppGroupReader.readPendingSharedItems.mockResolvedValue([
      sharedItem,
      item2,
    ]);
    mockFetchOgpMetadata.mockResolvedValue(null);
    mockCreateLinkWithStatus.mockResolvedValue({
      link_id: "link-1",
      url: sharedItem.url,
      status: "new",
    });
    mockAppGroupReader.deleteProcessedItem.mockResolvedValue(undefined);

    renderHook(() => usePendingSharedLinks(), { wrapper });

    await waitFor(() => {
      expect(mockCreateLinkWithStatus).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mockAppGroupReader.deleteProcessedItem).toHaveBeenCalledTimes(2);
    });
  });

  it("OGP 取得に失敗しても URL のみでリンクを作成する", async () => {
    mockAppGroupReader.readPendingSharedItems.mockResolvedValue([sharedItem]);
    mockFetchOgpMetadata.mockResolvedValue(null);
    mockCreateLinkWithStatus.mockResolvedValue({
      link_id: "link-1",
      url: sharedItem.url,
      status: "new",
    });
    mockAppGroupReader.deleteProcessedItem.mockResolvedValue(undefined);

    renderHook(() => usePendingSharedLinks(), { wrapper });

    await waitFor(() => {
      expect(mockCreateLinkWithStatus).toHaveBeenCalledWith({
        url: sharedItem.url,
        title: null,
        description: null,
        image_url: null,
        favicon_url: null,
        site_name: null,
      });
    });
  });

  it("リンク作成に失敗した場合はファイルを削除しない", async () => {
    mockAppGroupReader.readPendingSharedItems.mockResolvedValue([sharedItem]);
    mockFetchOgpMetadata.mockResolvedValue(null);
    mockCreateLinkWithStatus.mockRejectedValue(new Error("Create failed"));

    renderHook(() => usePendingSharedLinks(), { wrapper });

    await waitFor(() => {
      expect(mockCreateLinkWithStatus).toHaveBeenCalled();
    });

    // エラー時はファイルを削除しない
    expect(mockAppGroupReader.deleteProcessedItem).not.toHaveBeenCalled();
  });

  it("共有アイテムがない場合は何もしない", async () => {
    mockAppGroupReader.readPendingSharedItems.mockResolvedValue([]);

    renderHook(() => usePendingSharedLinks(), { wrapper });

    await waitFor(() => {
      expect(mockAppGroupReader.readPendingSharedItems).toHaveBeenCalled();
    });

    expect(mockFetchOgpMetadata).not.toHaveBeenCalled();
    expect(mockCreateLinkWithStatus).not.toHaveBeenCalled();
  });

  it("アプリがフォアグラウンドに復帰時に再処理する", async () => {
    mockAppGroupReader.readPendingSharedItems.mockResolvedValue([]);

    renderHook(() => usePendingSharedLinks(), { wrapper });

    // 初回呼び出しを待つ
    await waitFor(() => {
      expect(mockAppGroupReader.readPendingSharedItems).toHaveBeenCalledTimes(
        1,
      );
    });

    // 新しいアイテムが追加された状態をシミュレート
    mockAppGroupReader.readPendingSharedItems.mockResolvedValue([sharedItem]);
    mockFetchOgpMetadata.mockResolvedValue(null);
    mockCreateLinkWithStatus.mockResolvedValue({
      link_id: "link-1",
      url: sharedItem.url,
      status: "new",
    });
    mockAppGroupReader.deleteProcessedItem.mockResolvedValue(undefined);

    // フォアグラウンド復帰をシミュレート
    act(() => {
      mockAppStateListeners.forEach((listener) => listener("active"));
    });

    await waitFor(() => {
      expect(mockAppGroupReader.readPendingSharedItems).toHaveBeenCalledTimes(
        2,
      );
    });

    await waitFor(() => {
      expect(mockCreateLinkWithStatus).toHaveBeenCalled();
    });
  });
});

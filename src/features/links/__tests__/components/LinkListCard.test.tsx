import * as WebBrowser from "expo-web-browser";

import { fireEvent, render } from "@testing-library/react-native";

import { LinkListCard } from "../../components/LinkListCard";
import type { UserLink } from "../../types/linkList.types";
import { wrapper } from "../test-utils";

// expo-web-browserのモック（外部依存のみ）
jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    PAGE_SHEET: "pageSheet",
  },
  WebBrowserResultType: {
    CANCEL: "cancel",
    DISMISS: "dismiss",
    OPENED: "opened",
    LOCKED: "locked",
  },
}));

const mockOpenBrowserAsync = jest.mocked(WebBrowser.openBrowserAsync);

// モックデータヘルパー
const createMockLink = (
  url: string = "https://example.com",
  status: "inbox" | "read_soon" | "later" | null = "read_soon",
): UserLink => ({
  status_id: "status-1",
  user_id: "user-1",
  status,
  triaged_at: null,
  read_at: null,
  saved_at: "2024-01-01T00:00:00Z",
  link_id: "link-1",
  url,
  title: "Example Title",
  description: "Example Description",
  image_url: null,
  favicon_url: null,
  site_name: "Example Site",
  link_created_at: "2024-01-01T00:00:00Z",
});

describe("LinkListCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenBrowserAsync.mockResolvedValue({
      type: WebBrowser.WebBrowserResultType.CANCEL,
    });
  });

  it("外部リンクボタンを押下時にopenBrowserAsyncが正しいURLで呼ばれる", async () => {
    const testUrl = "https://example.com";
    const mockLink = createMockLink(testUrl);

    const { getByRole } = render(<LinkListCard link={mockLink} />, {
      wrapper,
    });

    // 外部リンクボタンを取得（accessibilityRole="button"を使用）
    const openLinkButton = getByRole("button");

    // ボタンを押下
    fireEvent.press(openLinkButton);

    // openBrowserAsyncが正しいURLとオプションで呼ばれることを確認
    expect(mockOpenBrowserAsync).toHaveBeenCalledTimes(1);
    expect(mockOpenBrowserAsync).toHaveBeenCalledWith(testUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: "#94a3b8",
      toolbarColor: "#FFFFFF",
      enableBarCollapsing: true,
    });
  });

  it("異なるURLでも正しくopenBrowserAsyncが呼ばれる", async () => {
    const testUrl = "https://different-example.com";
    const mockLink = createMockLink(testUrl);

    const { getByRole } = render(<LinkListCard link={mockLink} />, {
      wrapper,
    });

    const openLinkButton = getByRole("button");
    fireEvent.press(openLinkButton);

    expect(mockOpenBrowserAsync).toHaveBeenCalledWith(testUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: "#94a3b8",
      toolbarColor: "#FFFFFF",
      enableBarCollapsing: true,
    });
  });

  it("openBrowserAsyncでエラーが発生してもアプリがクラッシュしない", async () => {
    const testUrl = "https://example.com";
    const mockLink = createMockLink(testUrl);
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // エラーをスローするようにモックを設定
    mockOpenBrowserAsync.mockRejectedValueOnce(
      new Error("Failed to open browser"),
    );

    const { getByRole } = render(<LinkListCard link={mockLink} />, {
      wrapper,
    });

    const openLinkButton = getByRole("button");

    // エラーが発生しても例外がスローされないことを確認
    expect(() => {
      fireEvent.press(openLinkButton);
    }).not.toThrow();

    // エラーログが出力されることを確認
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

import * as WebBrowser from "expo-web-browser";

import { fireEvent, render } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { LinkListCard } from "../../components/LinkListCard";
import { wrapper } from "../test-utils";

// Supabaseクライアントのモック（外部依存のみ）
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

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
    // ボタンを押下
    fireEvent.press(getByRole("button"));

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

    fireEvent.press(getByRole("button"));

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

    // エラーが発生しても例外がスローされないことを確認
    expect(() => {
      fireEvent.press(getByRole("button"));
    }).not.toThrow();

    // エラーログが出力されることを確認
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  describe("ステータス表示", () => {
    it("newステータスが正しく表示される", () => {
      const mockLink = createMockLink("https://example.com", "new");
      const { getByText } = render(<LinkListCard link={mockLink} />, {
        wrapper,
      });

      // i18nextのモックはキーをそのまま返す
      expect(getByText("links.card.action_modal.status.new")).toBeTruthy();
    });

    it("read_soonステータスが正しく表示される", () => {
      const mockLink = createMockLink("https://example.com", "read_soon");
      const { getByText } = render(<LinkListCard link={mockLink} />, {
        wrapper,
      });

      expect(
        getByText("links.card.action_modal.status.read_soon"),
      ).toBeTruthy();
    });

    it("stockステータスが正しく表示される", () => {
      const mockLink = createMockLink("https://example.com", "stock");
      const { getByText } = render(<LinkListCard link={mockLink} />, {
        wrapper,
      });

      expect(getByText("links.card.action_modal.status.stock")).toBeTruthy();
    });

    it("doneステータスが正しく表示される", () => {
      const mockLink = createMockLink("https://example.com", "done");
      const { getByText } = render(<LinkListCard link={mockLink} />, {
        wrapper,
      });

      expect(getByText("links.card.action_modal.status.done")).toBeTruthy();
    });

    it("doneステータスは既読状態より優先して表示される", () => {
      const mockLink = createMockLink("https://example.com", "done");
      mockLink.read_at = "2024-01-01T00:00:00Z";
      const { getByText, queryByText } = render(
        <LinkListCard link={mockLink} />,
        {
          wrapper,
        },
      );

      // Doneステータスが表示される
      expect(getByText("links.card.action_modal.status.done")).toBeTruthy();
      // 既読状態は表示されない（Doneが優先）
      expect(queryByText("links.card.status.read")).toBeNull();
    });

    it("doneステータスでない場合でも、ステータスが表示される", () => {
      const mockLink = createMockLink("https://example.com", "new");
      mockLink.read_at = "2024-01-01T00:00:00Z";
      const { getByText } = render(<LinkListCard link={mockLink} />, {
        wrapper,
      });

      // ステータスが表示される（既読状態の優先表示ロジックは削除された）
      expect(getByText("links.card.action_modal.status.new")).toBeTruthy();
    });
  });
});

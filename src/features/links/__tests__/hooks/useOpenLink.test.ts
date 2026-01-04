import * as WebBrowser from "expo-web-browser";

import { act, renderHook } from "@testing-library/react-native";

import { useOpenLink } from "../../hooks/useOpenLink";

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

describe("useOpenLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenBrowserAsync.mockResolvedValue({
      type: WebBrowser.WebBrowserResultType.CANCEL,
    });
  });

  it("openLinkが正しいURLとオプションでopenBrowserAsyncを呼び出す", async () => {
    const { result } = renderHook(() => useOpenLink());
    const testUrl = "https://example.com";

    await act(async () => {
      await result.current.openLink(testUrl);
    });

    expect(mockOpenBrowserAsync).toHaveBeenCalledTimes(1);
    expect(mockOpenBrowserAsync).toHaveBeenCalledWith(testUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: "#94a3b8",
      toolbarColor: "#FFFFFF",
      enableBarCollapsing: true,
    });
  });

  it("openBrowserAsyncでエラーが発生しても例外をスローしない", async () => {
    const { result } = renderHook(() => useOpenLink());
    const testUrl = "https://example.com";
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockOpenBrowserAsync.mockRejectedValueOnce(
      new Error("Failed to open browser"),
    );

    await act(async () => {
      await result.current.openLink(testUrl);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to open browser:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});

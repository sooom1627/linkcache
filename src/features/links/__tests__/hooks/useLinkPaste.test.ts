import * as Clipboard from "expo-clipboard";

import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useLinkPaste } from "../../hooks/useLinkPaste";
import { fetchOgpMetadata } from "../../utils/metadata";
import { wrapper } from "../test-utils";

// expo-clipboardのモック
jest.mock("expo-clipboard", () => ({
  getStringAsync: jest.fn(),
}));

// メタデータ取得のモック
jest.mock("../../utils/metadata", () => ({
  fetchOgpMetadata: jest.fn(),
}));

describe("useLinkPaste", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("初期状態", () => {
    it("初期状態はempty", () => {
      const { result } = renderHook(() => useLinkPaste(), { wrapper });

      expect(result.current.status).toBe("empty");
      expect(result.current.preview).toBeNull();
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.canSave).toBe(false);
    });
  });

  describe("pasteFromClipboard", () => {
    it("loading状態に遷移する", async () => {
      // 遅延させてloading状態を確認
      let resolveClipboard: (value: string) => void;
      const delayedClipboard = new Promise<string>((resolve) => {
        resolveClipboard = resolve;
      });
      jest
        .mocked(Clipboard.getStringAsync)
        .mockReturnValueOnce(delayedClipboard);
      jest.mocked(fetchOgpMetadata).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useLinkPaste(), { wrapper });

      act(() => {
        result.current.pasteFromClipboard();
      });

      await waitFor(() => {
        expect(result.current.status).toBe("loading");
      });

      // クリーンアップ
      await act(async () => {
        resolveClipboard!("https://example.com");
      });
    });

    it("有効なURL + OGP取得成功でpreview状態に遷移", async () => {
      const mockMetadata = {
        title: "Example Title",
        description: "Example Description",
        image_url: "https://example.com/image.jpg",
        favicon_url: "https://example.com/favicon.ico",
        site_name: "Example Site",
      };

      jest
        .mocked(Clipboard.getStringAsync)
        .mockResolvedValueOnce("https://example.com/page");
      jest.mocked(fetchOgpMetadata).mockResolvedValueOnce(mockMetadata);

      const { result } = renderHook(() => useLinkPaste(), { wrapper });

      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(result.current.status).toBe("preview");
      expect(result.current.preview).toEqual({
        url: "https://example.com/page",
        title: "Example Title",
        imageUrl: "https://example.com/image.jpg",
        siteName: "Example Site",
        domain: "example.com",
        faviconUrl: "https://example.com/favicon.ico",
      });
      expect(result.current.canSave).toBe(true);
    });

    it("有効なURL + OGP取得失敗でnoOgp状態に遷移", async () => {
      jest
        .mocked(Clipboard.getStringAsync)
        .mockResolvedValueOnce("https://example.com");
      jest.mocked(fetchOgpMetadata).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useLinkPaste(), { wrapper });

      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(result.current.status).toBe("noOgp");
      expect(result.current.preview).toEqual({
        url: "https://example.com",
        title: null,
        imageUrl: null,
        siteName: null,
        domain: "example.com",
        faviconUrl: null,
      });
      expect(result.current.canSave).toBe(true);
    });

    it("無効なURLでinvalid状態に遷移", async () => {
      jest
        .mocked(Clipboard.getStringAsync)
        .mockResolvedValueOnce("not a valid url");

      const { result } = renderHook(() => useLinkPaste(), { wrapper });

      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(result.current.status).toBe("invalid");
      expect(result.current.errorMessage).toBeTruthy();
      expect(result.current.canSave).toBe(false);
    });

    it("空のクリップボードでinvalid状態に遷移", async () => {
      jest.mocked(Clipboard.getStringAsync).mockResolvedValueOnce("");

      const { result } = renderHook(() => useLinkPaste(), { wrapper });

      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(result.current.status).toBe("invalid");
      expect(result.current.canSave).toBe(false);
    });
  });

  describe("reset", () => {
    it("empty状態に戻る", async () => {
      jest
        .mocked(Clipboard.getStringAsync)
        .mockResolvedValueOnce("https://example.com");
      jest.mocked(fetchOgpMetadata).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useLinkPaste(), { wrapper });

      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(result.current.status).toBe("noOgp");

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe("empty");
      expect(result.current.preview).toBeNull();
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.canSave).toBe(false);
    });
  });
});

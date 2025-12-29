import { isValidUrl } from "../../utils/urlValidation";

describe("isValidUrl", () => {
  describe("有効なURL", () => {
    it("標準的なURLは有効", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("https://www.example.com")).toBe(true);
      expect(isValidUrl("http://example.com")).toBe(true);
    });

    it("サブドメイン付きURLは有効", () => {
      expect(isValidUrl("https://sub.example.com")).toBe(true);
      expect(isValidUrl("https://blog.example.co.jp")).toBe(true);
    });

    it("パス付きURLは有効", () => {
      expect(isValidUrl("https://example.com/path/to/page")).toBe(true);
      expect(isValidUrl("https://example.com/page.html")).toBe(true);
    });

    it("クエリパラメータ付きURLは有効", () => {
      expect(isValidUrl("https://example.com?q=test")).toBe(true);
      expect(isValidUrl("https://example.com/search?q=hello&page=1")).toBe(
        true,
      );
    });

    it("ハッシュフラグメント付きURLは有効", () => {
      expect(isValidUrl("https://example.com#section")).toBe(true);
      expect(isValidUrl("https://example.com/page#anchor")).toBe(true);
    });

    it("ポート番号付きURLは有効", () => {
      expect(isValidUrl("https://example.com:8080")).toBe(true);
      expect(isValidUrl("http://example.com:3000/path")).toBe(true);
    });

    it("日本語TLD（.jp）は有効", () => {
      expect(isValidUrl("https://example.jp")).toBe(true);
      expect(isValidUrl("https://example.co.jp")).toBe(true);
      expect(isValidUrl("https://example.ne.jp")).toBe(true);
    });

    it("様々なTLDは有効", () => {
      expect(isValidUrl("https://example.io")).toBe(true);
      expect(isValidUrl("https://example.dev")).toBe(true);
      expect(isValidUrl("https://example.org")).toBe(true);
      expect(isValidUrl("https://example.net")).toBe(true);
    });

    it("開発用localhost（ポート付き）は有効", () => {
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("http://localhost:8080/api")).toBe(true);
    });

    it("IPアドレスは有効", () => {
      expect(isValidUrl("http://192.168.1.1")).toBe(true);
      expect(isValidUrl("http://127.0.0.1:3000")).toBe(true);
      expect(isValidUrl("https://10.0.0.1/path")).toBe(true);
    });
  });

  describe("無効なURL", () => {
    it("TLDがないURLは無効", () => {
      expect(isValidUrl("https://hello")).toBe(false);
      expect(isValidUrl("https://example")).toBe(false);
    });

    it("プレーンなlocalhostは無効（ポートなし）", () => {
      // 開発環境でのみ使用するため、ポートなしは無効とする
      expect(isValidUrl("http://localhost")).toBe(false);
    });

    it("空白を含むURLは無効", () => {
      expect(isValidUrl("https://exam ple.com")).toBe(false);
      expect(isValidUrl("https://example.com/path with spaces")).toBe(false);
    });

    it("空文字は無効", () => {
      expect(isValidUrl("")).toBe(false);
    });

    it("プロトコルなしの単語は無効", () => {
      expect(isValidUrl("hello")).toBe(false);
      expect(isValidUrl("just some text")).toBe(false);
    });

    it("不正な形式は無効", () => {
      expect(isValidUrl("://example.com")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(false); // http/httpsのみ許可
    });
  });

  describe("プロトコル補完後の検証", () => {
    it("プロトコルなしでもTLDがあれば有効", () => {
      expect(isValidUrl("example.com")).toBe(true);
      expect(isValidUrl("www.example.com")).toBe(true);
    });

    it("プロトコルなしでTLDがなければ無効", () => {
      expect(isValidUrl("hello")).toBe(false);
      expect(isValidUrl("example")).toBe(false);
    });
  });
});


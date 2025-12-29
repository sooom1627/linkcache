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

    it("パブリックIPアドレスは有効", () => {
      expect(isValidUrl("http://8.8.8.8")).toBe(true); // Google DNS
      expect(isValidUrl("http://1.1.1.1")).toBe(true); // Cloudflare DNS
      expect(isValidUrl("https://203.0.113.1/path")).toBe(true); // TEST-NET-3
    });

    it("境界値のパブリックIPアドレスは有効", () => {
      expect(isValidUrl("http://1.2.3.4")).toBe(true);
      expect(isValidUrl("http://100.200.150.250")).toBe(true);
      expect(isValidUrl("http://11.0.0.1")).toBe(true); // 10.x.x.xの外
      expect(isValidUrl("http://172.15.0.1")).toBe(true); // 172.16-31の外
      expect(isValidUrl("http://172.32.0.1")).toBe(true); // 172.16-31の外
      expect(isValidUrl("http://192.167.1.1")).toBe(true); // 192.168.x.xの外
      expect(isValidUrl("http://169.253.255.255")).toBe(true); // 169.254.x.xの外
      expect(isValidUrl("http://223.255.255.255")).toBe(true); // マルチキャスト範囲の外
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

    it("無効なIPアドレス（オクテットが0-255の範囲外）は無効", () => {
      expect(isValidUrl("http://999.999.999.999")).toBe(false);
      expect(isValidUrl("http://256.1.1.1")).toBe(false);
      expect(isValidUrl("http://1.256.1.1")).toBe(false);
      expect(isValidUrl("http://1.1.256.1")).toBe(false);
      expect(isValidUrl("http://1.1.1.256")).toBe(false);
      expect(isValidUrl("http://300.300.300.300")).toBe(false);
    });

    it("プライベートIPアドレスは無効（セキュリティ対策）", () => {
      // 10.0.0.0/8
      expect(isValidUrl("http://10.0.0.1")).toBe(false);
      expect(isValidUrl("http://10.255.255.255")).toBe(false);

      // 172.16.0.0/12
      expect(isValidUrl("http://172.16.0.1")).toBe(false);
      expect(isValidUrl("http://172.31.255.255")).toBe(false);

      // 192.168.0.0/16
      expect(isValidUrl("http://192.168.0.1")).toBe(false);
      expect(isValidUrl("http://192.168.1.1")).toBe(false);
      expect(isValidUrl("http://192.168.255.255")).toBe(false);

      // 127.0.0.0/8 ループバック
      expect(isValidUrl("http://127.0.0.1")).toBe(false);
      expect(isValidUrl("http://127.0.0.1:3000")).toBe(false);
      expect(isValidUrl("http://127.255.255.255")).toBe(false);
    });

    it("0.0.0.0は無効（特殊アドレス）", () => {
      expect(isValidUrl("http://0.0.0.0")).toBe(false);
    });

    it("リンクローカルアドレス（169.254.x.x）は無効", () => {
      expect(isValidUrl("http://169.254.0.1")).toBe(false);
      expect(isValidUrl("http://169.254.255.255")).toBe(false);
      expect(isValidUrl("http://169.254.100.50")).toBe(false);
    });

    it("マルチキャストアドレス（224.0.0.0-239.255.255.255）は無効", () => {
      expect(isValidUrl("http://224.0.0.1")).toBe(false);
      expect(isValidUrl("http://239.255.255.255")).toBe(false);
      expect(isValidUrl("http://230.0.0.1")).toBe(false);
    });

    it("予約済みアドレス（240.0.0.0-255.255.255.254）は無効", () => {
      expect(isValidUrl("http://240.0.0.1")).toBe(false);
      expect(isValidUrl("http://250.100.50.25")).toBe(false);
      expect(isValidUrl("http://255.255.255.254")).toBe(false);
    });

    it("ブロードキャストアドレス（255.255.255.255）は無効", () => {
      expect(isValidUrl("http://255.255.255.255")).toBe(false);
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

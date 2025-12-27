import { normalizeUrl } from "../../utils/normalizeUrl";

describe("normalizeUrl", () => {
  describe("protocol handling", () => {
    it("adds https:// when no protocol is provided", () => {
      expect(normalizeUrl("example.com")).toBe("https://example.com");
    });

    it("keeps https:// as is", () => {
      expect(normalizeUrl("https://example.com")).toBe("https://example.com");
    });

    it("keeps http:// as is", () => {
      expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    });

    it("handles uppercase protocol", () => {
      expect(normalizeUrl("HTTPS://example.com")).toBe("https://example.com");
      expect(normalizeUrl("HTTP://example.com")).toBe("http://example.com");
    });
  });

  describe("hostname normalization", () => {
    it("converts hostname to lowercase", () => {
      expect(normalizeUrl("https://EXAMPLE.COM")).toBe("https://example.com");
      expect(normalizeUrl("https://Example.Com/Path")).toBe(
        "https://example.com/Path",
      );
    });

    it("handles www prefix", () => {
      expect(normalizeUrl("www.example.com")).toBe("https://www.example.com");
    });
  });

  describe("trailing slash handling", () => {
    it("removes trailing slash from root path", () => {
      expect(normalizeUrl("https://example.com/")).toBe("https://example.com");
    });

    it("removes trailing slash from path", () => {
      expect(normalizeUrl("https://example.com/path/")).toBe(
        "https://example.com/path",
      );
    });

    it("keeps path without trailing slash", () => {
      expect(normalizeUrl("https://example.com/path")).toBe(
        "https://example.com/path",
      );
    });
  });

  describe("path preservation", () => {
    it("preserves path case", () => {
      expect(normalizeUrl("https://example.com/Path/To/Page")).toBe(
        "https://example.com/Path/To/Page",
      );
    });

    it("preserves query parameters", () => {
      expect(normalizeUrl("https://example.com/path?foo=bar")).toBe(
        "https://example.com/path?foo=bar",
      );
    });

    it("preserves hash fragment", () => {
      expect(normalizeUrl("https://example.com/path#section")).toBe(
        "https://example.com/path#section",
      );
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(normalizeUrl("")).toBe("");
    });

    it("handles whitespace", () => {
      expect(normalizeUrl("  https://example.com  ")).toBe(
        "https://example.com",
      );
    });

    it("handles port numbers", () => {
      expect(normalizeUrl("https://example.com:8080/path")).toBe(
        "https://example.com:8080/path",
      );
    });

    it("returns original for invalid URLs", () => {
      expect(normalizeUrl("not a url")).toBe("not a url");
    });
  });
});

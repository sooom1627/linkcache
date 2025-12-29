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

  describe("tracking parameter removal", () => {
    describe("Google Analytics (UTM) parameters", () => {
      it("removes utm_source", () => {
        expect(normalizeUrl("https://example.com?utm_source=twitter")).toBe(
          "https://example.com",
        );
      });

      it("removes all utm_ parameters", () => {
        expect(
          normalizeUrl(
            "https://example.com?utm_source=fb&utm_medium=social&utm_campaign=test",
          ),
        ).toBe("https://example.com");
      });

      it("keeps non-utm parameters when removing utm", () => {
        expect(
          normalizeUrl("https://example.com?id=123&utm_source=twitter"),
        ).toBe("https://example.com?id=123");
      });
    });

    describe("Facebook parameters", () => {
      it("removes fbclid", () => {
        expect(normalizeUrl("https://example.com?fbclid=abc123")).toBe(
          "https://example.com",
        );
      });
    });

    describe("Google Ads parameters", () => {
      it("removes gclid", () => {
        expect(normalizeUrl("https://example.com?gclid=xyz789")).toBe(
          "https://example.com",
        );
      });

      it("removes gclsrc", () => {
        expect(normalizeUrl("https://example.com?gclsrc=aw.ds")).toBe(
          "https://example.com",
        );
      });
    });

    describe("other tracking parameters", () => {
      it("removes _ga parameter", () => {
        expect(normalizeUrl("https://example.com?_ga=1.2.3.4")).toBe(
          "https://example.com",
        );
      });

      it("removes mc_eid parameter", () => {
        expect(normalizeUrl("https://example.com?mc_eid=abc")).toBe(
          "https://example.com",
        );
      });
    });

    describe("preserves functional parameters", () => {
      it("keeps YouTube video ID", () => {
        expect(normalizeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
          "https://youtube.com/watch?v=dQw4w9WgXcQ",
        );
      });

      it("keeps Amazon product ID and removes tracking", () => {
        expect(
          normalizeUrl("https://amazon.com/dp/B08N5WRWNW?ref=abc&tag=test"),
        ).toBe("https://amazon.com/dp/B08N5WRWNW");
      });

      it("keeps search queries", () => {
        expect(normalizeUrl("https://google.com/search?q=hello")).toBe(
          "https://google.com/search?q=hello",
        );
      });

      it("keeps pagination parameters", () => {
        expect(normalizeUrl("https://example.com/list?page=2&limit=10")).toBe(
          "https://example.com/list?page=2&limit=10",
        );
      });
    });

    describe("mixed parameters", () => {
      it("removes only tracking parameters from mixed URL", () => {
        expect(
          normalizeUrl(
            "https://example.com/article?id=123&utm_source=fb&page=1&fbclid=xyz",
          ),
        ).toBe("https://example.com/article?id=123&page=1");
      });
    });
  });
});

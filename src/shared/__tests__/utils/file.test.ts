import { getExtensionFromMimeType } from "../../utils/file";

describe("file utils", () => {
  describe("getExtensionFromMimeType", () => {
    it("returns correct extension for known mime types", () => {
      expect(getExtensionFromMimeType("image/jpeg")).toBe("jpg");
      expect(getExtensionFromMimeType("image/png")).toBe("png");
      expect(getExtensionFromMimeType("image/webp")).toBe("webp");
    });

    it("defaults to jpg for unknown mime types", () => {
      expect(getExtensionFromMimeType("application/pdf")).toBe("jpg");
      expect(getExtensionFromMimeType("unknown/type")).toBe("jpg");
    });
  });

  // Skip convertFileToArrayBuffer as it depends on File API which might not be available/easy to mock without setup
  // and is a simple wrapper.
});

import AsyncStorage from "@react-native-async-storage/async-storage";

import i18n from "../../utils/i18n";
import {
  getCurrentLanguage,
  initLanguageFromStorage,
  setLanguage,
} from "../../utils/langSetting";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock i18n
jest.mock("../../utils/i18n", () => ({
  __esModule: true,
  default: {
    language: "en",
    changeLanguage: jest.fn(() => Promise.resolve()),
  },
}));

describe("langSetting utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset i18n language mock
    (i18n.language as string) = "en";
  });

  describe("initLanguageFromStorage", () => {
    it("returns 'en' and does not change language if storage is null", async () => {
      jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

      const lang = await initLanguageFromStorage();

      expect(lang).toBe("en");
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("lang");
      // Should not call changeLanguage if already en
      expect(i18n.changeLanguage).not.toHaveBeenCalled();
    });

    it("returns stored language and changes i18n if valid 'ja' is stored", async () => {
      jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce("ja");
      (i18n.language as string) = "en";

      const lang = await initLanguageFromStorage();

      expect(lang).toBe("ja");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("ja");
    });

    it("defaults to 'en' and repairs storage if invalid language is stored", async () => {
      jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce("invalid-lang");
      (i18n.language as string) = "en";

      const lang = await initLanguageFromStorage();

      expect(lang).toBe("en");
      // Should overwrite storage with 'en'
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("lang", "en");
    });

    it("handles AsyncStorage errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      jest
        .mocked(AsyncStorage.getItem)
        .mockRejectedValueOnce(new Error("Storage error"));

      const lang = await initLanguageFromStorage();

      expect(lang).toBe("en");
      // Should try to set default
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("lang", "en");
      consoleSpy.mockRestore();
    });
  });

  describe("setLanguage", () => {
    it("saves to storage and changes i18n language", async () => {
      await setLanguage("ja");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("lang", "ja");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("ja");
    });

    it("throws error if storage fails", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      jest
        .mocked(AsyncStorage.setItem)
        .mockRejectedValueOnce(new Error("Storage fail"));

      await expect(setLanguage("en")).rejects.toThrow("Storage fail");
      consoleSpy.mockRestore();
    });
  });

  describe("getCurrentLanguage", () => {
    it("returns current i18n language if valid", () => {
      (i18n.language as string) = "ja";
      expect(getCurrentLanguage()).toBe("ja");
    });

    it("returns 'en' if current i18n language is invalid", () => {
      (i18n.language as string) = "es"; // not supported
      expect(getCurrentLanguage()).toBe("en");
    });
  });
});

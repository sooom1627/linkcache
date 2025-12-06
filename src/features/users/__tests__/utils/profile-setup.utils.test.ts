import type { TFunction } from "i18next";

import {
  getUserIdHelperText,
  isSubmitEnabled,
} from "../../utils/profile-setup.utils";

// Mock TFunction
const mockT = (key: string) => key;

describe("profile-setup.utils", () => {
  describe("getUserIdHelperText", () => {
    // biome-ignore lint/suspicious/noExplicitAny: mock
    const t = mockT as unknown as TFunction<"translation", undefined>;

    it("returns undefined when userId length is less than 4", () => {
      expect(
        getUserIdHelperText(t, "abc", false, null, undefined),
      ).toBeUndefined();
    });

    it("returns undefined when userId matches originalUserId", () => {
      expect(
        getUserIdHelperText(t, "user123", false, null, undefined, "user123"),
      ).toBeUndefined();
    });

    it("returns checking state", () => {
      const result = getUserIdHelperText(t, "user123", true, null, undefined);
      expect(result).toEqual({
        text: "users.setting_modal.profile_edit.form_validation_messages.checking_availability",
        color: "text-gray-500",
      });
    });

    it("returns error state", () => {
      const result = getUserIdHelperText(
        t,
        "user123",
        false,
        new Error("Error"),
        undefined,
      );
      expect(result).toEqual({
        text: "users.setting_modal.profile_edit.form_validation_messages.error_checking_availability",
        color: "text-red-600",
      });
    });

    it("returns available state", () => {
      const result = getUserIdHelperText(t, "user123", false, null, true);
      expect(result).toEqual({
        text: "users.setting_modal.profile_edit.form_validation_messages.available",
        color: "text-green-600",
      });
    });

    it("returns already taken state", () => {
      const result = getUserIdHelperText(t, "user123", false, null, false);
      expect(result).toEqual({
        text: "users.setting_modal.profile_edit.form_validation_messages.already_taken",
        color: "text-red-600",
      });
    });
  });

  describe("isSubmitEnabled", () => {
    it("returns false when isPending is true", () => {
      expect(
        isSubmitEnabled(true, true, "user123", "Test User", {}, undefined),
      ).toBe(false);
    });

    it("returns false when userId is empty", () => {
      expect(isSubmitEnabled(false, true, "", "Test User", {}, undefined)).toBe(
        false,
      );
    });

    it("returns false when username is empty", () => {
      expect(isSubmitEnabled(false, true, "user123", "", {}, undefined)).toBe(
        false,
      );
    });

    it("returns false when there are validation errors", () => {
      expect(
        isSubmitEnabled(
          false,
          true,
          "user123",
          "Test User",
          { user_id: "Error" },
          undefined,
        ),
      ).toBe(false);
    });

    it("returns false when userId is not available (shouldCheckUserId = true)", () => {
      expect(
        isSubmitEnabled(false, false, "user123", "Test User", {}, true),
      ).toBe(false);
    });

    it("returns false when userId is not available (shouldCheckUserId = false/undefined)", () => {
      // NOTE: Even if check is not strictly required, if available is explicitly false, it should likely be disabled
      // or the logic implies if it's NOT available (and checked), it's bad.
      // Looking at source:
      // if (!shouldCheckUserId && isUserIdAvailable === false) return false;
      expect(
        isSubmitEnabled(false, false, "user123", "Test User", {}, false),
      ).toBe(false);
    });

    it("returns true when all conditions are met", () => {
      expect(
        isSubmitEnabled(false, true, "user123", "Test User", {}, undefined),
      ).toBe(true);
    });
  });
});

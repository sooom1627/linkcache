import {
  calculateSwipeThreshold,
  determineSwipeDirection,
  swipeThresholdRatio,
} from "../../utils/swipe-gesture";

describe("swipe-gesture utils", () => {
  describe("calculateSwipeThreshold", () => {
    it("calculates threshold based on screen width and ratio", () => {
      const screenWidth = 375;
      const expected = screenWidth * swipeThresholdRatio;
      expect(calculateSwipeThreshold(screenWidth)).toBe(expected);
    });

    it("handles zero width", () => {
      expect(calculateSwipeThreshold(0)).toBe(0);
    });
  });

  describe("determineSwipeDirection", () => {
    const threshold = 100;

    it("returns 'right' when translationX exceeds positive threshold", () => {
      expect(determineSwipeDirection(101, threshold)).toBe("right");
    });

    it("returns 'left' when translationX exceeds negative threshold", () => {
      expect(determineSwipeDirection(-101, threshold)).toBe("left");
    });

    it("returns null when translationX is within threshold (positive)", () => {
      expect(determineSwipeDirection(99, threshold)).toBeNull();
    });

    it("returns null when translationX is within threshold (negative)", () => {
      expect(determineSwipeDirection(-99, threshold)).toBeNull();
    });

    it("returns null when translationX equals threshold", () => {
      expect(determineSwipeDirection(100, threshold)).toBeNull();
      expect(determineSwipeDirection(-100, threshold)).toBeNull();
    });
  });
});

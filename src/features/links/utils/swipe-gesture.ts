// 閾値計算とスワイプ方向判定のピュア関数
export const swipeThresholdRatio = 0.3; // 画面幅の30%

export type SwipeDirection = "left" | "right" | null;

export function calculateSwipeThreshold(screenWidth: number): number {
  return screenWidth * swipeThresholdRatio;
}

export function determineSwipeDirection(
  translationX: number,
  threshold: number,
): SwipeDirection {
  if (translationX > threshold) return "right";
  if (translationX < -threshold) return "left";
  return null;
}

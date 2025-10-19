import { useCallback, useRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

/**
 * BottomSheetModalの開閉状態を管理するフック
 *
 * @example
 * ```tsx
 * const { ref, present, dismiss } = useBottomSheetModal();
 *
 * <Button onPress={present}>モーダルを開く</Button>
 * <BaseBottomSheetModal ref={ref}>
 *   <Button onPress={dismiss}>閉じる</Button>
 * </BaseBottomSheetModal>
 * ```
 */
export function useBottomSheetModal() {
  const ref = useRef<BottomSheetModal>(null);

  /**
   * モーダルを表示
   */
  const present = useCallback(() => {
    ref.current?.present();
  }, []);

  /**
   * モーダルを非表示
   */
  const dismiss = useCallback(() => {
    ref.current?.dismiss();
  }, []);

  /**
   * 特定のスナップポイントにスナップ
   * @param index スナップポイントのインデックス
   */
  const snapToIndex = useCallback((index: number) => {
    ref.current?.snapToIndex(index);
  }, []);

  /**
   * 特定の位置にスナップ
   * @param position ピクセル単位の位置
   */
  const snapToPosition = useCallback((position: number) => {
    ref.current?.snapToPosition(position);
  }, []);

  /**
   * モーダルを閉じる（dismissのエイリアス）
   */
  const close = useCallback(() => {
    ref.current?.dismiss();
  }, []);

  return {
    ref,
    present,
    dismiss,
    close,
    snapToIndex,
    snapToPosition,
  };
}

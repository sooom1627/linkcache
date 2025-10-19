import type { PropsWithChildren } from "react";
import { forwardRef, useMemo } from "react";

import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

export interface BaseBottomSheetModalProps
  extends Partial<BottomSheetModalProps> {
  /**
   * スナップポイント（モーダルの高さ）
   * @example ['25%', '50%', '90%'] or [200, 400, 600]
   * @default ['50%', '90%']
   */
  snapPoints?: (string | number)[];

  /**
   * 背景をタップして閉じるか
   * @default true
   */
  enableDismissOnBackdrop?: boolean;

  /**
   * 背景の不透明度
   * @default 0.5
   */
  backdropOpacity?: number;

  /**
   * 背景の色
   * @default '#000000'
   */
  backdropColor?: string;

  /**
   * パンダウンジェスチャーでモーダルを閉じるか
   * @default true
   */
  enablePanDownToClose?: boolean;

  /**
   * ハンドル表示の有無
   * @default true
   */
  handleIndicatorStyle?: BottomSheetModalProps["handleIndicatorStyle"];
}

/**
 * 再利用可能なBottomSheetModalベースコンポーネント
 *
 * @example
 * ```tsx
 * const modalRef = useRef<BottomSheetModal>(null);
 *
 * // 表示
 * modalRef.current?.present();
 *
 * // 非表示
 * modalRef.current?.dismiss();
 *
 * <BaseBottomSheetModal ref={modalRef} snapPoints={['50%', '90%']}>
 *   <View>コンテンツ</View>
 * </BaseBottomSheetModal>
 * ```
 */
export const BaseBottomSheetModal = forwardRef<
  BottomSheetModal,
  PropsWithChildren<BaseBottomSheetModalProps>
>(
  (
    {
      children,
      snapPoints = ["50%", "90%"],
      enableDismissOnBackdrop = true,
      backdropOpacity = 0.5,
      backdropColor = "#000000",
      enablePanDownToClose = true,
      handleIndicatorStyle,
      ...props
    },
    ref,
  ) => {
    // スナップポイントのメモ化
    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    // 背景コンポーネントのレンダリング
    const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={backdropOpacity}
        style={[backdropProps.style, { backgroundColor: backdropColor }]}
        pressBehavior={enableDismissOnBackdrop ? "close" : "none"}
      />
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={memoizedSnapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={enablePanDownToClose}
        handleIndicatorStyle={
          handleIndicatorStyle || {
            backgroundColor: "#D1D5DB",
            width: 40,
            height: 4,
          }
        }
        {...props}
      >
        <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);

BaseBottomSheetModal.displayName = "BaseBottomSheetModal";

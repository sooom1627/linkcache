import type { PropsWithChildren } from "react";
import { forwardRef, useMemo } from "react";

import type { ScrollViewProps } from "react-native";

import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

export interface ScrollableBottomSheetModalProps
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
   * ScrollViewのプロパティ
   */
  scrollViewProps?: Partial<ScrollViewProps>;
}

/**
 * スクロール対応のBottomSheetModalコンポーネント
 * 長いコンテンツに適しています
 *
 * @example
 * ```tsx
 * const modalRef = useRef<BottomSheetModal>(null);
 *
 * <ScrollableBottomSheetModal ref={modalRef} snapPoints={['50%', '90%']}>
 *   <View>
 *     <Text>長いコンテンツ...</Text>
 *   </View>
 * </ScrollableBottomSheetModal>
 * ```
 */
export const ScrollableBottomSheetModal = forwardRef<
  BottomSheetModal,
  PropsWithChildren<ScrollableBottomSheetModalProps>
>(
  (
    {
      children,
      snapPoints = ["50%", "90%"],
      enableDismissOnBackdrop = true,
      backdropOpacity = 0.5,
      backdropColor = "#000000",
      enablePanDownToClose = true,
      scrollViewProps,
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
        handleIndicatorStyle={{
          backgroundColor: "#D1D5DB",
          width: 40,
          height: 4,
        }}
        {...props}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            { paddingBottom: 20 },
            scrollViewProps?.contentContainerStyle,
          ]}
          {...scrollViewProps}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

ScrollableBottomSheetModal.displayName = "ScrollableBottomSheetModal";

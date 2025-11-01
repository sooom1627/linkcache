import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

/**
 * モーダルの種類
 */
export type ModalType = "setting" | "profileEdit" | "localeSetting";

/**
 * モーダルRefsの型定義
 */
export type ModalRefs = Record<
  ModalType,
  React.RefObject<BottomSheetModal | null>
>;

/**
 * モーダルコンテキストの型定義
 */
interface ModalContextType {
  /**
   * 指定したモーダルを開く
   * @param modalType - 開くモーダルの種類
   */
  openModal: (modalType: ModalType) => void;

  /**
   * 指定したモーダルを閉じる
   * @param modalType - 閉じるモーダルの種類
   */
  closeModal: (modalType: ModalType) => void;

  /**
   * 全てのモーダルを閉じる
   */
  closeAllModals: () => void;
}

/**
 * モーダルコンテキスト
 */
const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * モーダルコンテキストプロバイダー（ロジックのみ）
 */
export function ModalContextProvider({
  children,
  refs,
}: PropsWithChildren<{ refs: ModalRefs }>) {
  /**
   * 指定したモーダルを開く
   */
  const openModal = useCallback(
    (modalType: ModalType) => {
      refs[modalType]?.current?.present();
    },
    [refs],
  );

  /**
   * 指定したモーダルを閉じる
   */
  const closeModal = useCallback(
    (modalType: ModalType) => {
      refs[modalType]?.current?.dismiss();
    },
    [refs],
  );

  /**
   * 全てのモーダルを閉じる
   */
  const closeAllModals = useCallback(() => {
    (Object.keys(refs) as ModalType[]).forEach((modalType) => {
      refs[modalType]?.current?.dismiss();
    });
  }, [refs]);

  const value: ModalContextType = useMemo(
    () => ({
      openModal,
      closeModal,
      closeAllModals,
    }),
    [openModal, closeModal, closeAllModals],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

/**
 * モーダルコンテキストを使用するカスタムフック
 *
 * @throws {Error} ModalProvider の外で使用された場合
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { openModal, closeModal } = useModal();
 *
 *   return (
 *     <Button onPress={() => openModal("setting")}>設定を開く</Button>
 *   );
 * }
 * ```
 */
export function useModal(): ModalContextType {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
}

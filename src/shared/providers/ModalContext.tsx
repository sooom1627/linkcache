import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

/**
 * モーダルの種類
 */
export type ModalType = "setting" | "profileEdit";

/**
 * モーダルコンテキストの型定義
 */
interface ModalContextType {
  /**
   * 設定モーダルを開く
   */
  openSetting: () => void;

  /**
   * 設定モーダルを閉じる
   */
  closeSetting: () => void;

  /**
   * プロフィール編集モーダルを開く
   */
  openProfileEdit: () => void;

  /**
   * プロフィール編集モーダルを閉じる
   */
  closeProfileEdit: () => void;

  /**
   * 全てのモーダルを閉じる
   */
  closeAll: () => void;
}

/**
 * モーダルRefsの型定義
 */
export interface ModalRefs {
  settingModalRef: React.RefObject<BottomSheetModal | null>;
  profileEditModalRef: React.RefObject<BottomSheetModal | null>;
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
  const { settingModalRef, profileEditModalRef } = refs;

  /**
   * 設定モーダルを開く
   */
  const openSetting = useCallback(() => {
    settingModalRef.current?.present();
  }, [settingModalRef]);

  /**
   * 設定モーダルを閉じる
   */
  const closeSetting = useCallback(() => {
    settingModalRef.current?.dismiss();
  }, [settingModalRef]);

  /**
   * プロフィール編集モーダルを開く
   */
  const openProfileEdit = useCallback(() => {
    profileEditModalRef.current?.present();
  }, [profileEditModalRef]);

  /**
   * プロフィール編集モーダルを閉じる
   */
  const closeProfileEdit = useCallback(() => {
    profileEditModalRef.current?.dismiss();
  }, [profileEditModalRef]);

  /**
   * 全てのモーダルを閉じる
   */
  const closeAll = useCallback(() => {
    settingModalRef.current?.dismiss();
    profileEditModalRef.current?.dismiss();
  }, [settingModalRef, profileEditModalRef]);

  const value: ModalContextType = {
    openSetting,
    closeSetting,
    openProfileEdit,
    closeProfileEdit,
    closeAll,
  };

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
 *   const { openSetting, closeSetting } = useModal();
 *
 *   return (
 *     <Button onPress={openSetting}>設定を開く</Button>
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

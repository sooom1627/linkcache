import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { SettingScreen } from "@/src/features/users";

/**
 * モーダルの種類
 */
export type ModalType = "setting";

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
   * 全てのモーダルを閉じる
   */
  closeAll: () => void;
}

/**
 * モーダルコンテキスト
 */
const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * モーダルプロバイダー
 * アプリ全体で使用するモーダルを一元管理
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * <ModalProvider>
 *   <App />
 * </ModalProvider>
 * ```
 */
export function ModalProvider({ children }: PropsWithChildren) {
  // 各モーダルのref
  const settingModalRef = useRef<BottomSheetModal>(null);

  /**
   * 設定モーダルを開く
   */
  const openSetting = useCallback(() => {
    settingModalRef.current?.present();
  }, []);

  /**
   * 設定モーダルを閉じる
   */
  const closeSetting = useCallback(() => {
    settingModalRef.current?.dismiss();
  }, []);

  /**
   * 全てのモーダルを閉じる
   */
  const closeAll = useCallback(() => {
    settingModalRef.current?.dismiss();
    // 将来的に他のモーダルも追加
  }, []);

  const value: ModalContextType = {
    openSetting,
    closeSetting,
    closeAll,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* モーダルコンポーネント - アプリ全体で1インスタンス */}
      <SettingScreen ref={settingModalRef} onClose={closeSetting} />

      {/* 将来的に他のモーダルを追加 */}
      {/* <FilterModal ref={filterModalRef} onClose={closeFilter} /> */}
      {/* <ConfirmModal ref={confirmModalRef} onClose={closeConfirm} /> */}
    </ModalContext.Provider>
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

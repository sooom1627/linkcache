import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ProfileEditModal } from "@/src/features/users/screens/ProfileEditModal";
import { SettingModal } from "@/src/features/users/screens/SettingModal";

import type { ModalRefs } from "./ModalContext";
import { ModalContextProvider } from "./ModalContext";

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
  const profileEditModalRef = useRef<BottomSheetModal>(null);

  // refsオブジェクトをメモ化
  const refs: ModalRefs = useMemo(
    () => ({
      setting: settingModalRef,
      profileEdit: profileEditModalRef,
    }),
    [],
  );

  // 各モーダルのclose関数
  const closeSetting = useCallback(
    () => settingModalRef.current?.dismiss(),
    [],
  );
  const closeProfileEdit = useCallback(
    () => profileEditModalRef.current?.dismiss(),
    [],
  );

  // すべてのモーダルを閉じる関数
  const closeAllModals = useCallback(() => {
    settingModalRef.current?.dismiss();
    profileEditModalRef.current?.dismiss();
  }, []);

  return (
    <ModalContextProvider refs={refs}>
      {children}

      {/* モーダルコンポーネント - アプリ全体で1インスタンス */}
      <SettingModal
        ref={settingModalRef}
        onClose={closeSetting}
        onCloseAll={closeAllModals}
      />
      <ProfileEditModal ref={profileEditModalRef} onClose={closeProfileEdit} />

      {/* 将来的に他のモーダルを追加 */}
      {/* <FilterModal ref={filterModalRef} onClose={closeFilter} /> */}
      {/* <ConfirmModal ref={confirmModalRef} onClose={closeConfirm} /> */}
    </ModalContextProvider>
  );
}

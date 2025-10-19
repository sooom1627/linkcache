import type { PropsWithChildren } from "react";
import { useRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ProfileEditModal } from "@/src/features/users/screens/ProfileEditModal";
import { SettingModal } from "@/src/features/users/screens/SettingModal";

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

  const closeSettings = () => settingModalRef.current?.dismiss();
  const closeProfileEdit = () => profileEditModalRef.current?.dismiss();

  return (
    <ModalContextProvider
      refs={{
        settingModalRef,
        profileEditModalRef,
      }}
    >
      {children}

      {/* モーダルコンポーネント - アプリ全体で1インスタンス */}
      <SettingModal ref={settingModalRef} onClose={closeSettings} />
      <ProfileEditModal ref={profileEditModalRef} onClose={closeProfileEdit} />

      {/* 将来的に他のモーダルを追加 */}
      {/* <FilterModal ref={filterModalRef} onClose={closeFilter} /> */}
      {/* <ConfirmModal ref={confirmModalRef} onClose={closeConfirm} /> */}
    </ModalContextProvider>
  );
}

import type { ComponentType, PropsWithChildren } from "react";
import { useCallback, useMemo, useRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { LocaleSettingModal } from "@/src/features/users/screens/LocaleSettingModal";
import { ProfileEditModal } from "@/src/features/users/screens/ProfileEditModal";
import { SettingModal } from "@/src/features/users/screens/SettingModal";

import type { ModalRefs, ModalType } from "./ModalContext";
import { ModalContextProvider } from "./ModalContext";

/**
 * モーダルの基本プロパティ型定義
 */
interface BaseModalProps {
  onClose?: () => void;
  onCloseAll?: () => void;
}

/**
 * モーダル設定の型定義
 */
interface ModalConfig {
  type: ModalType;
  component: ComponentType<
    BaseModalProps & { ref: React.RefObject<BottomSheetModal | null> }
  >;
  needsCloseAll?: boolean;
}

/**
 * モーダル設定配列
 * 新しいモーダルを追加する場合は、この配列に追加するだけで自動的に管理されます
 */
const MODAL_CONFIGS: ModalConfig[] = [
  { type: "setting", component: SettingModal, needsCloseAll: true },
  { type: "profileEdit", component: ProfileEditModal, needsCloseAll: false },
  {
    type: "localeSetting",
    component: LocaleSettingModal,
    needsCloseAll: false,
  },
  // 新しいモーダルをここに追加
  // { type: "filter", component: FilterModal, needsCloseAll: false },
  // { type: "confirm", component: ConfirmModal, needsCloseAll: false },
];

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
  // 各モーダルのrefを動的に生成
  const settingRef = useRef<BottomSheetModal | null>(null);
  const profileEditRef = useRef<BottomSheetModal | null>(null);
  const localeSettingRef = useRef<BottomSheetModal | null>(null);

  const modalRefs = useMemo(
    () => ({
      setting: settingRef,
      profileEdit: profileEditRef,
      localeSetting: localeSettingRef,
    }),
    [],
  );

  // refsオブジェクトをメモ化
  const refs: ModalRefs = modalRefs;

  // 各モーダルのclose関数を動的に生成
  const closeHandlers = useMemo(
    () =>
      MODAL_CONFIGS.reduce(
        (acc, { type }) => {
          acc[type] = () => modalRefs[type]?.current?.dismiss();
          return acc;
        },
        {} as Record<ModalType, () => void>,
      ),
    [modalRefs],
  );

  // すべてのモーダルを閉じる関数
  const closeAllModals = useCallback(() => {
    MODAL_CONFIGS.forEach(({ type }) => {
      modalRefs[type]?.current?.dismiss();
    });
  }, [modalRefs]);

  return (
    <ModalContextProvider refs={refs}>
      {children}

      {/* モーダルコンポーネント - アプリ全体で1インスタンス */}
      {MODAL_CONFIGS.map(({ type, component, needsCloseAll }) => {
        const ModalComponent = component;
        return (
          <ModalComponent
            key={type}
            ref={modalRefs[type]}
            onClose={closeHandlers[type]}
            {...(needsCloseAll && { onCloseAll: closeAllModals })}
          />
        );
      })}
    </ModalContextProvider>
  );
}
